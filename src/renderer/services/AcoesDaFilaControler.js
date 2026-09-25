import * as cheerio from "cheerio";




//BUSCA OS ITENS DO HISTORICO
export async function itensDoHistorico(CodUsuario){
    const fastSession = await window.electron.getFastMedicSession();
    const endpoint = "/celere.embudasartes/CompartilhadoHistoricoUsuario/BuscaGridIndice"
    const data = new Date().toLocaleDateString("pt-BR");

    const dados = {
        "CodUsuario": CodUsuario,
        "DatInicial": data,
        "DatFinal": data,
        "TipoVisualizacao": "2",
        "session": fastSession
        }

    const response = await window.electron.simplePostRequest(endpoint, dados)

    const $ = cheerio.load(`<table><tbody>${response}</tbody></table>`);

        const resultados = [];

        $("tr.table-tr").each((_, elemento) => {
            const dados = Object.fromEntries(
                Object.entries(elemento.attribs)
                    .filter(([chave]) => chave.startsWith("data-"))
                    .map(([chave, valor]) => [
                        chave.replace("data-", ""),
                        valor
                    ])
            );

            resultados.push(dados);
        });


        return resultados[0];

// {
//   "codfces": 238,
//   "rca": "R",
//   "numatendimento": 36433,
//   "seqitematendimentoorigem": "",
//   "seqitematendimento": 1,
//   "codacaodestino": 3,
//   "dscacaodestino": "ACOLHIMENTO / CLASSIFICAÇÃO DE RISCO",
//   "codusuario": 1,
//   "nomfantasia": "PRONTO SOCORRO CENTRAL",
//   "numsiasus": "",
//   "codconfiglocal": "",
//   "dsctemconduta": "SIM",
//   "datatendimento": "24/09/2026 16:59:44",
//   "codfcesprofconsrealizador": 4319,
//   "removeassinatura": true,
//   "Prontuario": true,
//   "fpcOrigem": 0,
//   "codMunOrigem": 0,
//   "session": "43fff3aa-efe3-f414-46b5-a57530e8fed1"
// }
}



export async function modalRelatorioUsuario(dados){

    const fastSession = await window.electron.getFastMedicSession();
    const endpoint = "/celere.embudasartes/CompartilhadoHistoricoUsuario/ModalRelatorioUsuario"

    const response = await window.electron.simplePostRequest(endpoint, dados)
    
}


export async function retornaDadosLogado(){

    const fastSession = await window.electron.getFastMedicSession();
    const endpoint = "/celere.embudasartes/Login/RetornaDadosLogado"

    const response = await window.electron.simplePostRequest(endpoint, fastSession)
    return response

// EXEMPLO DE DADOS RETURNADOS PELO ENDPOINT ACIMA
// {
//   "CodEstabelecimento": 238,
//   "NomeEstabelecimento": "PRONTO SOCORRO CENTRAL",
//   "NomeProfissional": "LUCAS BRAGA CELERE TECNOLOGIA",
//   "Login": "44957764875",
//   "DescricaoModulo": "Módulo Atendimento",
//   "CodModulo": 2,
//   "DescricaoSubModulo": " Pronto Atendimento",
//   "CodSubModulo": 2,
//   "NomeOrgao": "PREFEITURA DE EMBU DAS ARTES",
//   "CodMunicipioCliente": 90,
//   "CodProfissional": 17,
//   "NumCpfCertificado": null,
//   "CodFcesProfissionalConselho": 4319,
//   "CodCbos": 2635,
//   "IndCertificadoNuvem": false,
//   "CodFcesOficial": 2077078,
//   "Preceptorado": false
// }
}

export async function preparaRelatorio(CodUsuario) {

    const fastSession = await window.electron.getFastMedicSession();

    const endpoint =
        "/celere.embudasartes/CompartilhadoRelatorios/PreparaRelatorio";

    const ultimoProntuarioPdf = await itensDoHistorico(CodUsuario);
    const dadosLogado = JSON.parse(await retornaDadosLogado());
    console.log("Dadoslogado",dadosLogado)
    console.log("ultimoProntuarioPdf", ultimoProntuarioPdf)

    const prontuario = ultimoProntuarioPdf;

    const dados = new URLSearchParams({
        // Dados do prontuário
        codfces: prontuario.codfces,
        rca: prontuario.rca,
        numatendimento: prontuario.numatendimento,
        seqitematendimentoorigem: prontuario.seqitematendimentoorigem,
        seqitematendimento: prontuario.seqitematendimento,
        codacaodestino: prontuario.codacaodestino,
        dscacaodestino: prontuario.dscacaodestino,
        codusuario: String(CodUsuario),
        nomfantasia: prontuario.nomfantasia,
        numsiasus: prontuario.numsiasus,
        codconfiglocal: "",
        dsctemconduta: prontuario.temconduta,
        datatendimento: prontuario.datatendimento,
        codfcesprofconsrealizador:
            prontuario.codfcesprofconsrealizador,

        // Valores da requisição original
        removeassinatura: "true",
        Prontuario: "true",
        fpcOrigem: "0",
        codMunOrigem: "0",
        indatendimento: "1",

        // Dados do usuário logado
        codsubmodulo: String(dadosLogado.CodSubModulo),
        codMunicipioCliente: String(dadosLogado.CodMunicipioCliente),
        codFcesLogada: String(dadosLogado.CodEstabelecimento),
        codFcesProfissionalConselhoLogado:
            String(dadosLogado.CodFcesProfissionalConselho),

        CodMunicipioCliente: String(dadosLogado.CodMunicipioCliente),
        CodEstabelecimento: String(dadosLogado.CodEstabelecimento),
        NomeEstabelecimento: dadosLogado.NomeEstabelecimento,
        NomeProfissional: dadosLogado.NomeProfissional,
        Login: dadosLogado.Login,
        DescricaoModulo: dadosLogado.DescricaoModulo,
        CodModulo: String(dadosLogado.CodModulo),
        DescricaoSubModulo: dadosLogado.DescricaoSubModulo,
        NomeOrgao: dadosLogado.NomeOrgao,
        CodProfLogado: String(dadosLogado.CodProfissional),
        CodCbos: String(dadosLogado.CodCbos),
        CodFcesProfissionalConselho:
            String(dadosLogado.CodFcesProfissionalConselho),
        CodSubModulo: String(dadosLogado.CodSubModulo),
        NumCpfCertificado:
            dadosLogado.NumCpfCertificado ?? "",
        CodFcesOficial: String(dadosLogado.CodFcesOficial),
        Preceptorado: String(dadosLogado.Preceptorado),

        // Sessão
        session: fastSession
    }).toString();

    // console.log("URL PARAMNS", dados) 

    const payload = {
        parametros: dados,
        session: fastSession
    };


    const response = JSON.parse(JSON.parse(await window.electron.simplePostRequest(endpoint, payload)));

    const pdfToken = await gerarPDF(response.Resultado)

    return pdfToken
}


export async function gerarPDF(guidPrint){
    
    const fastSession = await window.electron.getFastMedicSession();
    const endpoint = "/celere.embudasartes/rep/Report/PrintPdf2"

    const dados = {
        "guidPrint": guidPrint,
        "session": fastSession
        }

    const response = window.electron.simplePostRequest(endpoint, dados)
    return response
}



