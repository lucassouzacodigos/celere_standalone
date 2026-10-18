
import * as cheerio from 'cheerio'



export async function CadastrarUsuarioCNS(cns){
    const infosPeloCns = await getInformaçoesUsandoCNS(cns)
    const segundaChamada = await segundaChamadaCadSus(cns)

    const dadosFinais = await extrairCadastroUsuario(segundaChamada)
    
    //coreçoes no json final
    dadosFinais.cadUsuarioInicialVD.CodPais = "10"
    dadosFinais.cadUsuarioInicialVD.IndMoradaorRua = "on"
    dadosFinais.cadUsuarioInicialVD.DscLogradouro = "PESSOA EM SITUAÇÃO DE RUA"
    dadosFinais.cadUsuarioInicialVD.CodLogradouro = "-1"
    dadosFinais.cadUsuarioInicialVD.NumEndereco = "0"
    dadosFinais.cadUsuarioInicialVD.IndRacaCor = "4"
    if (dadosFinais.cadUsuarioInicialVD.NumTelefone?.length == 11){
        dadosFinais.cadUsuarioInicialVD.NumTelefone = dadosFinais.cadUsuarioInicialVD.NumTelefone.replace(/^(\d{2})(\d{5})(\d{4})$/,"($1) $2-$3") || ""
    }

    const fastSession = await window.electron.getFastMedicSession();
    const endpoint = "/celere.embudasartes/CompartilhadoUsuario/InserirUsuario";

    const response = await window.electron.simplePostRequest(endpoint, dadosFinais)
    const parsed = JSON.parse(JSON.parse(response))

    if (parsed.Sucesso == true){
        console.log("Usuario: " + parsed.Resultado.NomUsuario)
        console.log("CNS: " + parsed.Resultado.NumCartaoSaude)
        console.log("ID: " + parsed.Resultado.CodUsuario)
        return parsed.Resultado.NomUsuario + "Cadastrado "
    } else {
        console.log(parsed.Mensagem)
        return parsed.Mensagem
    }

}


export async function getInformaçoesUsandoCNS(cns){

    const fastSession = await window.electron.getFastMedicSession();
    const endpoint = "/celere.embudasartes/CompartilhadoUsuario/CartaoUsuarioEmUso";

    const dados = {
        "NumCartaoSaude":cns,
        "usuarioDomicilio":0,
        "session":fastSession
    }


    const response = await window.electron.simplePostRequest(endpoint, dados)
    // console.log(response)
    return response

}


export async function segundaChamadaCadSus(cns){

    const fastSession = await window.electron.getFastMedicSession();
    const endpoint = "/celere.embudasartes/CompartilhadoDomicilio/DetalhesUsuarioCadSUS";

    const dados = {
        "numCartao":cns,
        "isModal":false,
        "origemChamada":"CADUSUARIO",
        "session":fastSession
    }


    const response = await window.electron.simplePostRequest(endpoint, dados)
    // console.log(response)
    return response


}






export async function extrairCadastroUsuario(html) {
    const $ = cheerio.load(html);

    // Lê o valor de um campo pelo ID.
    const campo = (id, fallback = "") => {
        const el = $(`#${id}`).first();

        if (!el.length) return fallback;

        if (el.is(":checkbox")) {
            return el.is(":checked");
        }

        if (el.is("select")) {
            return el.val() ?? fallback;
        }

        return el.val() ?? fallback;
    };

    // Campos que o backend espera como indicadores textuais.
    const texto = (id, fallback = "") => {
        const valor = campo(id, fallback);
        return typeof valor === "boolean"
            ? String(valor)
            : String(valor ?? fallback);
    };

    const checkbox = (id) => campo(id, false) === true;

    // Extrai documentos da tabela.
    const ListaDocumento = $("#grdCadUsuDocumentoIdentificacao tr")
        .map((_, el) => {
            const tr = $(el);

            if (!tr.attr("data-codtipodocumento")) {
                return null;
            }

            return {
                CodTipoDocumento: tr.attr("data-codtipodocumento") || "",
                DscCampo1: tr.attr("data-dsccampo1") || "",
                DscCampo2: tr.attr("data-dsccampo2") || "",
                DscCampo3: tr.attr("data-dsccampo3") || "",
                DscCampo4: tr.attr("data-dsccampo4") || "",
                DatDocumento: tr.attr("data-datdocumento") || "",
                CodUf: tr.attr("data-coduf") || "",
                CodOrgao: tr.attr("data-codorgao") || "",
                CodUsuarioDocumento:
                    tr.attr("data-codusuariodocumento") || "0",
                CodUsuario: tr.attr("data-codusuario") || "0",
            };
        })
        .get()
        .filter(Boolean);

    // Extrai os cartões SUS.
    const ListaCartao = $("#grdCadUsuCartao tr")
        .map((_, el) => {
            const tr = $(el);

            if (!tr.attr("data-numcartaosaude")) {
                return null;
            }

            return {
                CodUsuario: tr.attr("data-codusuario") || "",
                NumCartaoSaude: tr.attr("data-numcartaosaude") || "",
                IndTipoCartao: tr.attr("data-indtipocartao") || "1",
                IndDefinitivo: tr.attr("data-inddefinitivo") || "1",
            };
        })
        .get()
        .filter(Boolean);

    const cadUsuarioInicialVD = {
        // Identificação e controle
        CodMunicipio: texto("CadUsuario_CodMunicipio"),
        CodOficialMunicipio: texto("CadUsuario_CodOficialMunicipio"),
        CodUf: texto("CadUsuario_CodUf"),
        CodLogradouro: texto("CadUsuario_CodLogradouro", "-1"),
        CodEstabelecimento: texto("CadUsuario_CodEstabelecimento"),
        IndSituacaoCadastro: texto("CadUsuario_IndSituacaoCadastro", "1"),
        SeqUsuarioCartao: texto("CadUsuario_SeqUsuarioCartao", "1"),
        DatCadastro: texto("CadUsuario_DatCadastro"),
        DatAtual: texto("CadUsuario_DatAtual"),
        CodDomicilio: texto("CadUsuario_CodDomicilio", "0"),
        IndObrigaNacionalidadeNaturalidade:
            texto("CadUsuario_IndObrigaNacionalidadeNaturalidade", "False"),
        oldNomUsuario: texto("CadUsuario_oldNomUsuario"),
        CodMunicipioFces: texto("CadUsuario_CodMunicipioFces"),
        IndMudou: texto("CadUsuario_IndMudou", "0"),
        CodUsuarioIntegracao: texto("CadUsuario_CodUsuarioIntegracao", "0"),
        IndTipoPesquisa: texto("CadUsuario_IndTipoPesquisa", "2"),
        IndJustificativaNaoCpf:
            texto("CadUsuario_IndJustificativaNaoCpf", "False"),
        IndCpfObrigatorio: texto("CadUsuario_Param_IndCpfObrigatorio", "0"),
        IndNaoPodeSerRespCadUsu:
            texto("CadUsuario_Param_IndNaoPodeSerRespCadUsu", "0"),

        // Dados pessoais
        NomUsuarioOficial: texto("CadUsuario_NomUsuarioOficial"),
        DatNascimento: texto("CadUsuario_DatNascimento"),
        NomUsuario: texto("CadUsuario_NomUsuario"),
        CodIdGenero: texto("CadUsuario_TipGenero"),
        NumProntuarioPapel: texto("CadUsuario_NumProntuarioPapel"),
        NomMae: texto("CadUsuario_NomMae"),
        NomPai: texto("CadUsuario_NomPai"),
        IndRacaCor: texto("CadUsuario_IndRacaCor"),
        CodEtniaIndigena: texto("CadUsuario_CodEtniaIndigena"),
        CodNacionalidade: texto("CadUsuario_CodNacionalidade"),
        CodPais: texto("CadUsuario_CodPais"),
        DatEntradaPais: texto("CadUsuario_DatEntradaPais"),

        // Naturalidade
        CodNatMunicipio: texto("CadUsuario_CodNatMunicipio"),
        CodOficialMunicNat:
            texto("CadUsuario_NaturalidadeCodOficialMunicipio"),
        DscMunicipioNat: texto("CadUsuario_DscMunicipioNat"),
        CodUfNat: texto("CadUsuario_NaturalidadeCodUfNaturalidade"),

        // Contatos
        NumTelefoneCelular: texto("CadUsuario_NumTelefoneCelular"),
        NumTelefoneAplicativo: texto("CadUsuario_NumTelefoneAplicativo"),
        NumTelefone: texto("CadUsuario_NumTelefone"),
        NomeTelefoneContato: texto("CadUsuario_NomeTelefoneContato"),
        NumTelefoneContato: texto("CadUsuario_NumTelefoneContato"),

        // Endereço
        IndMoradaorRua: checkbox("CadUsuario_IndMoradorRua") ? "on" : "",
        NumCep: texto("CadUsuario_NumCep"),
        DscLogradouro: texto("CadUsuario_DscLogradouro"),
        NumEndereco: texto("CadUsuario_NumEndereco"),
        DscComplemento: texto("CadUsuario_DscComplemento"),
        DscBairro: texto("CadUsuario_DscBairro"),
        DscMunicipio: texto("CadUsuario_DscMunicipio"),
        PontoReferencia: texto("CadUsuario_PontoReferencia"),
        Email: texto("CadUsuario_Email"),
        Observacao: texto("CadUsuario_Observacao"),

        // Registro
        CodUsuario: texto("CadUsuario_CodUsuario", "0"),
        IndAlteraFcesResponsavel: false,
        TipSexo: texto("CadUsuario_comboSexo"),

        // Documentos e cartões
        ListaDocumento,
        IndSemNumero: checkbox("CadUsuario_IndSemNumero") ? 1 : 0,
        IndUsuarioRecusouCadastro:
            checkbox("CadUsuario_IndUsuarioRecusouCadastro") ? 1 : 0,

        Questionario: {
            ListaQuestoes: [],
        },

        IndAlterouFoto:
            texto("FotoUsuario_IndAlterouFoto", "False").toLowerCase() === "true",

        IndWhatsApp: checkbox("CadUsuario_IndWhatsApp"),
        IndTemTelefone: checkbox("CadUsuario_IndTemTelefone"),
        IndPossuiCelular: checkbox("CadUsuario_IndPossuiCelular"),

        ListaCartao,
        ListaCartaoParaExcluir: [],
        Justificativa: "",
        CodJustificativa: null,
    };

    return {
        cadUsuarioInicialVD
    };
}

