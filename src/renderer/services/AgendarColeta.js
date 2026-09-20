import * as dbControler from "./dbcursor"




async function fechar() {
    window.electron.closeElectron()
}



//get todos os dados do paciente
const getDadosPaciente = async (documento) => {

    const FAST_SessionId = await window.electron.getFastMedicSession()

    const dados = {
        "numeroCartaoSaude":documento,
        "tipoPesquisa":0,
        "session":FAST_SessionId
    }
    
    const response = await window.electron.getUserIDByCNS(dados)
    
    if (response == "[]") {
        console.log("cns = []")
        return "[]"
    } else {
        return response
    }
}








//Get alguns informações do doutor que esta pedindo esse exame pelo codigo do conselho
async function getDadosDoutor(codConselho) {

    const fastMedicSession = await window.electron.getFastMedicSession()
    
    const dados = {
            "numConselho": codConselho,
            "idQuery": 3,
            "session": fastMedicSession
        }

        const response = await window.electron.getDadosDoutor(dados)
        return response
}





// simula o "salvar" com o "Procedimentos" marcado na recepção, isso retorna algumas informações necessarios pra agendar uma coleta
async function iniciarProcessoAgendamentoColeta(codUsuario){

    const fastMedicSession = await window.electron.getFastMedicSession()

    const dados = {
        "salvarRecepcao": {
            "CodUsuario": codUsuario,
            "CodSubModuloSistema": "1",
            "IndPriorizaAtendimento": 0,
            "listaOpcoesRecepcao": [
                {
                    "CodAcaoDestino": 17, //procedimentos
                    "IndSituacao": 1,
                    "IndPriorizacao": 0
                }
                ],
                "CodUsuarioAcompanhante": null,
                "CodClassificacaoRisco": null
            },
        "session": fastMedicSession
        }

        const response = await window.electron.iniciarProcessoAgendamentoColeta(dados)

        //informacoes que precisamos
        // console.log(response)
        return {
            "CodFces" : response.NovoAtendimento.ListaAtendimentosFilhos[0].CodFces,
            "NumAtendimento" : response.NovoAtendimento.ListaAtendimentosFilhos[0].NumAtendimento,
            "CodAcaoDestino" : response.NovoAtendimento.ListaAtendimentosFilhos[0].CodAcaoDestino
        }

}



//getnome do paciente 
    const getNomePorDocumento = async (documento) => {

        const fastMedicSession = await window.electron.getFastMedicSession()

        const dados = {
            "numeroCartaoSaude":documento,
            "tipoPesquisa":0,
            "session":fastMedicSession
        }
        
        const response = await window.electron.getUserIDByCNS(dados)
        
        if (response == "[]") {
            console.log("cns = []")
            return "[]"
        } else {
            return response?.NomUsuario
        }
    }










//agenda primeiro um exame da coleta de materais, pra posteriormente ser agendado em um dia da semana
async function AgendarColetaDeExameGenerico(documento, crmDoutor, dataParaColeta) {

    
    const fastMedicSession = await window.electron.getFastMedicSession()
    const dadosDoutor = await getDadosDoutor(crmDoutor)
    const dadosPaciente = await getDadosPaciente(documento)
    const pacienteInseridoProcedimentos =  await iniciarProcessoAgendamentoColeta(dadosPaciente.CodUsuario)
    const dadosFormatados = await window.electron.getDadosFormatados()



    const dados = {
        "DataRealizacao": "01/01/0001 00:00:00",
        "CodProfissionalConselho": dadosDoutor[0].CodProfissionalConselho, //Cod do doutor que pediu o exams
        "Atendimento": {
            "CodFces": pacienteInseridoProcedimentos.CodFces,
            "CodFcesAtendimento": 0,
            "NumAtendimento": pacienteInseridoProcedimentos.NumAtendimento,
            "NumAtendimentoAntigo": 0,
            "SeqItemAtendimento": 1,
            "SeqItemAtendimentoAntigo": 0,
            "SeqItemAtendimentoOrigem": 0,
            "CodUsuario": dadosPaciente.CodUsuario,
            "NomUsuario": null,
            "CodAcaoOrigem": 1,
            "CodAcaoDestino": 17, // procedimentos = 17
            "CodAcaoDestinoAntigo": 0,
            "TipoSexo": dadosPaciente.TipSexo,
            "IndPriorizacao": 0,
            "NumChamadas": 0,
            "CodPriorizacaoFila": 0,
            "DscAcao": null,
            "IndSituacao": 0,
            "HoraConsulta": null,
            "CorPriorizacaoFila": null,
            "IndTipoConsulta": 0,
            "CodEspecialidade": 0,
            "CodEspecialidadeAntigo": 0,
            "CodCBOS2002": "137",
            "CodGrupoEspecialidade": "2",
            "CodSubModuloSistema": 1,
            "CodFcesProfissionalConselho": 0,
            "NumIdade": 0,
            "CodCid": null,
            "DscCid": null,
            "VerificaConsultaComplementar": false,
            "CodProfissionalConselho": 0,
            "CodFcesUsuario": 0,
            "IndInformaCid": false,
            "CodConsultaFilaEspera": 0,
            "FilaCodAcaoDestino": 0,
            "JaAtendidos": false,
            "IndEncerraInternacao": 0,
            "DscEncerraInternacao": null,
            "CodProtocolo": 0,
            "NumPosicaoFila": 0,
            "CodMotivoEncerramento": null,
            "NumDiasConsultaCompUb": null,
            "SeqConsulta": null,
            "MsgTeleApoioConsulta": false,
            "IndRecepcionado": null,
            "CorPriorizacaoFilaLeito": null,
            "DscPriorizacaoFilaLeito": null,
            "DscSituacaoLeito": null,
            "IndOrigemLeito": false,
            "IndUsoLocal": 0,
            "NomAbaMonitoramento": null,
            "CodGrupoEspecialidadeFila": 0,
            "CodFcesProfConsConsulta": 0
        },
        "DataSolicitacao": "01/01/0001 00:00:00",
        "DscObservacao": null,
        "DscJustificativa": null,
        "CodCid": null,
        "UltimoAcolhimento": {
            "Altura": 0,
            "Peso": 0,
            "DataAcolhimento": null,
            "MassaCorporalCalculado": ""
        },
        "ListaSolicitacaoProcedimentos": [
            {
            "QtdAutorizacaoOriginal": "1",
            "RequisicaoSiscel": {},
            "DscJustificativaInfringirSexoSolProced": null,
            "QtdViasImpressao": "1",
            "QtdViasImpressaoPA": "0",
            "IndExigeCid": false,
            "AuxSolicitadoAnteriormente": false,
            "CodClassificacaoProcedimento": "4",
            "CodTabelaSusOficial": "0201020041", // COLETA DE MATERIAL PARA EXAME LABORATORIAL
            "IndExigeDetalhamento": "0",
            "IndDescricaoObrigatoria": "false",
            "IndExigeCns": true,
            "IndSituacao": 1,
            "CodTabelaSus": "363",
            "DscTabelaSus": "COLETA DE MATERIAL PARA EXAME LABORATORIAL ",
            "Enable": false,
            "QtdAutorizacao": "1",
            "DscJustificativaProced60": null,
            "CodProtocoloSaude": 0,
            "IndObrigaSelecionarTodos": 0,
            "salvo": false,
            "IndRealizado": false,
            "QtdDiaMinIntervaloSessao": 1,
            "DscObservacaoProcedimento": "",
            "errors": []
            }
        ],
        "CodPerfilFilaEspera": 0,
        "IndEncaminhaParaFilaAtendimento": true,
        "JustificativaCidInvalido": null,
        "session": fastMedicSession
        }

        // console.log(dados)

        const response = await window.electron.AgendarColetaDeExameGenerico(dados)
        console.log(response.Mensagem)
        //nesse ponto, o exame generico ja deve estar adicionado ao paciente

        //entao essa funcao abaixo, pega o pedido do exame e marca o dia da coleta dele
        const respostaMarcaDiaColeta = await marcarDiaColetaDoExameGenerico(dadosPaciente.CodUsuario, dataParaColeta, pacienteInseridoProcedimentos.NumAtendimento, pacienteInseridoProcedimentos.CodFces)


        const postoColetaLog = respostaMarcaDiaColeta.postoColeta
        const quemAgendou = dadosFormatados.nome
        const agendadoPara = dadosDoutor[0].NomeProfissional
        const pacienteAgendado = await getNomePorDocumento(dadosPaciente.CodUsuario)

        // console.log(respostaMarcaDiaColeta.postoColeta)
        // console.log(dadosFormatados.nome)
        // console.log(dadosDoutor[0].NomeProfissional)
        // console.log(await getNomePorDocumento(dadosPaciente.CodUsuario))

        //log -- infos que vao para o banco
        dbControler.addRegister(postoColetaLog, quemAgendou, agendadoPara, 'Agendamento coleta', pacienteAgendado)


        return response.Mensagem
}


// primeiro request para pegar dados do posto de coleta ( o default é qual o seu token logado esta vinculado )
async function iniciarMarcacaoDeDataDeColetaParaExame (CodUsuario){
    
    const fastMedicSession = await window.electron.getFastMedicSession()

    const dados = {
        "CodFces": 0,
        "NumAtendimento": 0,
        "SeqItemAtendimento": 0,
        "CodUsuario": CodUsuario,
        "session": fastMedicSession
        }

    const response = await window.electron.iniciarMarcacaoDeDataDeColetaParaExame(dados)
    // console.log(response)
    // console.log(response.Resultado.CodPostoColetaSelecionado)



    return response
    }


//marcar de fato a coleta em um dia especifico
async function marcarDiaColetaDoExameGenerico(CodUsuario, dataParaColeta, NumAtendimento, CodFces){
    
    const dadosAbrirAgendaColeta = await iniciarMarcacaoDeDataDeColetaParaExame(CodUsuario)
    const fastMedicSession = await window.electron.getFastMedicSession()

    const dados = {
        "codPostoColetaSelecionado": dadosAbrirAgendaColeta.Resultado.CodPostoColetaSelecionado,
        "datSelecionada": dataParaColeta,
        "codUsuario": CodUsuario,
        "listaExames": [
            {
            "IndMarcado": true,
            "CodFces": CodFces,
            "NumAtendimento": NumAtendimento,
            "SeqItemAtendimento": 1,
            "NumSiasus": 363,
            "SeqProcedimento": 1,
            "DatRealizacao": null,
            "CodPostoColeta": 0,
            "IndPrioridade": false
            }
        ],
        "session": fastMedicSession
        }

    const postoColeta = dadosAbrirAgendaColeta.Resultado.ListaPostosColeta[0].DscPostoColeta
    const response = await window.electron.marcarDiaColetaDoExameGenerico(dados)

    return {
        "postoColeta": postoColeta,
        "mensagem": response
    }
}







export { fechar, AgendarColetaDeExameGenerico, iniciarMarcacaoDeDataDeColetaParaExame, iniciarProcessoAgendamentoColeta, getDadosDoutor, getDadosPaciente }