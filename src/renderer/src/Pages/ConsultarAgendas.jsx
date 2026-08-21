import { data, useNavigate } from "react-router-dom"
import "../assets/main.css"
import { useEffect, useRef, useState } from 'react'
import casinha from "../assets/home.png"
import HomeButton from "../components/HomeButton"
import DatePicker from "react-datepicker"
import 'react-datepicker/dist/react-datepicker.css'
import { AnimatePresence, motion } from "motion/react"
import { Lock, SaveAll, Trash2, UserSearch, LockKeyhole } from "lucide-react"
import ResultadosPesquisaModal from "../components/ResultadoPesquisaModal/ResultadosPesquisaModal"
import { addRegister } from "../../services/dbcursor"


export default function ConsultarAgendas() {
    const navigate = useNavigate()
    const [profissionais, setProfissionais] = useState([]);
    const [profissionalId, setProfissionalId] = useState("");
    const [tipoAgenda, setTipoAgenda] = useState("");
    const [idCBOProfissional, setIdCBOProfissional] = useState("");
    const [horarios, setHorarios] = useState();
    const [FAST_SessionId, setFAST_SessionId] = useState("")
    const [data_selecionada, setData_selecionada] = useState(formatarData(new Date()))
    const [cidadaoID, setCidadaoID] = useState("")
    const [cnsParaAgendar, setCnsParaAgendar] = useState({})
    const [errosAgendamento, setErrosAgendamento] = useState({})
    const [inputAtivo, setInputAtivo] = useState(null)
    const [opcoesBloqueio , setOpcoesBloqueio] = useState([])
    const [idBloqueio, setIdBloqueio] = useState(10)
    const [dadosFormatados, setDadosFormatados] = useState({})
    const [cnsPorHorario, setCnsPorHorario] = useState({})
    const inputPdfRef = useRef(null)

    function formatarData(data) {
        const dia = String(data.getDate()).padStart(2, "0")
        const mes = String(data.getMonth() + 1).padStart(2, "0")
        return `${dia}/${mes}/${data.getFullYear()}`
    }

    function normalizarNome(nome) {
        return nome
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, " ")
            .trim()
            .toUpperCase()
    }

    function extrairDadosPdf(texto) {
        const textoPdf = texto.replace(/\r/g, "")
        const data = textoPdf.match(/Data:\s*(\d{2}\/\d{2}\/\d{4})/i)?.[1]
        const profissional = textoPdf
            .match(/Profissional:\s*([^\n]+)/i)?.[1]
            ?.split(" - ")[0]
            .trim()
        const cnsPorHorarioExtraido = {}
        const blocos = textoPdf.matchAll(
            /(?:^|\n)\s*(\d{2}:\d{2})\s+[\s\S]*?(?=\n\s*\d{2}:\d{2}\s|$)/g
        )

        for (const bloco of blocos) {
            const hora = bloco[1]
            const cns = bloco[0].match(/CNS:\s*(\d{15})/i)?.[1]
            if (cns) cnsPorHorarioExtraido[hora] = cns
        }

        return { data, profissional, cnsPorHorario: cnsPorHorarioExtraido }
    }

    function horaDoHorario(horario) {
        return horario.hora?.match(/\d{2}:\d{2}/)?.[0] || ""
    }

    const importarPdf = async (event) => {
        setErrosAgendamento({})
        const file = event.target.files[0]
        event.target.value = ""
        if (!file) return

        setHorarios([])
        setCnsParaAgendar({})
        setCnsPorHorario({})

        const arrayBuffer = await file.arrayBuffer()
        const resultado = await window.electron.extrairTextoPdf(new Uint8Array(arrayBuffer))
        if (!resultado.sucesso) {
            alert(`Não foi possível ler o PDF: ${resultado.erro}`)
            return
        }

        const dadosPdf = extrairDadosPdf(resultado.texto)
        setCnsPorHorario(dadosPdf.cnsPorHorario)

        if (!dadosPdf.data || !dadosPdf.profissional) {
            alert("Não foi possível identificar a data e o profissional no PDF.")
            return
        }

        if (dadosPdf.data) {
            const [dia, mes, ano] = dadosPdf.data.split("/")
            setData_selecionada(dadosPdf.data)
            document.querySelector(".inputData").value = `${ano}-${mes}-${dia}`
        }

        const profissionalPdf = normalizarNome(dadosPdf.profissional || "")
        const profissionalEncontrado = profissionais.find((profissional) => {
            const nomeSelect = profissional.texto.split(" - ")[0]
            return normalizarNome(nomeSelect) === profissionalPdf
        })

        if (profissionalEncontrado) {
            const [id, tipo, cbo] = profissionalEncontrado.value.split(",")
            setProfissionalId(id)
            setTipoAgenda(tipo)
            setIdCBOProfissional(cbo)
            document.querySelector(".selectProfissional").value = profissionalEncontrado.value

            const resposta = await window.electron.verificarHorariosDoDia({
                datConsulta: dadosPdf.data,
                codProfissional: id,
                codSiasusSms: tipo,
                tipVisualizacao: 1,
                codAcaoOrigem: "0",
                codGrupoEspecialidade: cbo,
                indTeleatendimento: false,
                indMobilidade: false,
                session: FAST_SessionId
            })

            setCnsParaAgendar((prev) => {
                const preenchidos = { ...prev }
                resposta.forEach((horario) => {
                    const cns = dadosPdf.cnsPorHorario[horaDoHorario(horario)]
                    if (cns) preenchidos[horario.seqAgenda] = cns
                })
                return preenchidos
            })
            setHorarios(resposta)
        } else {
            alert("O profissional do PDF não foi encontrado no select.")
        }
    }
    
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));



    const salvar = async () => {
        //limpa os erros pra proxima run
        
    for (const horario of horarios) {

        // pula horários que já possuem usuário
        if (horario.usuario && horario.usuario.trim() !== "") {
            console.log("Pulando vaga já ocupada:", horario.hora, horario.usuario);
            continue;
        }

        const cns = cnsParaAgendar[horario.seqAgenda];

        // pula se não tiver CNS digitado
        if (!cns) {
            continue;
        }

        console.log("Agendando agora: " + horario.hora, cns);

        await agendarUsuarioPorCPFouCNS(
            cns,
            horario.seqAgenda,
            horario.codParametroAgenda
        );

        await sleep(150);
    }

    await verificarHorariosDoDia()
    console.log(errosAgendamento)
};

    const agendarUsuarioPorCPFouCNS = async (documento, seqAgenda, codParametroAgenda, directID) => {


        const IDCidadao = await getUserIDByCNS(documento)
        await getDadosLogin()

        const dados = {
            "codUsuario": directID || IDCidadao,  //ID do cidadao pra ser agendado
            "situacaoUsuario": 0,
            "codSiasusSms": tipoAgenda,  //codigo do tipo da agenda (clinica medica, odonto, etc)
            "codTipoAgendamento": "2",  // qual tipo de agendamento  2 = Eletiva Pre agendada
            "codParametroAgenda": codParametroAgenda,  // alguma coisa sobre agendas separadas com bloqueios
            "numAtendimento": "0",
            "seqAgenda": seqAgenda,  //Indice de qual vaga agendar
            "seqItemAtendimento": "",
            "dataSelecionada": data_selecionada,  // dia
            "codAcaoOrigem": "33",  
            "indEncaixe": "False",
            "indPriorizar": "false",
            "situacaoAgenda": 1,  // as vezes muda 
            "codProfissional": profissionalId,  // ID Do profissional dono da aegnda
            "telaOrigem": "",
            "indAgendamentoInterconsulta": "False",
            "codTeleAtendimento": null,
            "listaProcedimentosAgendados": [],
            "dscOrientacao": "",
            "dscObsAgendamento": "",
            "session":FAST_SessionId
        }

        if (IDCidadao == undefined && !directID) {
            console.log("Erro ao agendar, CNS Nao cadastrado")
            setErrosAgendamento((prev) => ({
                ...prev,
                [seqAgenda]: documento,
            }))
            return;
        }

        const response = await window.electron.agendarUsuarioPorCPFouCNS(dados)

        if (response.sucesso) {
            console.log("Agendado com sucesso, Adicionado ao log")
            //log
            const nomeProfissionalDonoDaAgenda = profissionais.find(agenda => agenda.value.split(",")[0] == profissionalId).texto.split(" - ")[0].trim()
            addRegister(dadosFormatados.unidade, dadosFormatados?.nome, nomeProfissionalDonoDaAgenda, "Agendamento")
        }

    }


    const deletarAgendamentoUsuario = async (codParametroAgenda, seqAgendaDelete) => {

        await getDadosLogin()

        //pega a lista de quem pode ser deletado no dia
        const agendaCompletaParaDeletar = await getListaComHorariosParaDeletar()
        console.log(agendaCompletaParaDeletar)

        const objetoToDelete = await agendaCompletaParaDeletar.find(obj => {
            return obj.SeqAgenda == seqAgendaDelete && 
            obj.CodParametroAgenda == codParametroAgenda
        })
        // console.log(agendaCompletaParaDeletar)


        //MONTA A DATA EM FORMATO ISO, JA QUE O END POINT PEDE
        const [dia, mes, ano] = data_selecionada.split("/");
        const dataISO = new Date(
        `${ano}-${mes}-${dia}T00:00:00-03:00`
        ).toISOString();
        console.log(dataISO);

        const dados = {
            "codProfissional":profissionalId,
            "codTipoCancelamentoAgendamento":4,  /// 4 = outros
            "dataOrigem":dataISO,
            "listaAgendamento":[
                objetoToDelete
            ],
            "session":FAST_SessionId
        }

        const deletarHorario = await window.electron.deletarHorario(dados)

        //log
        const nomeProfissionalDonoDaAgenda = profissionais.find(agenda => agenda.value.split(",")[0] == profissionalId).texto.split(" - ")[0].trim()
        addRegister(dadosFormatados.unidade, dadosFormatados?.nome, nomeProfissionalDonoDaAgenda, "Cancelamento")

        
        await verificarHorariosDoDia()
    }

    // faz request no end point que retorna os usuarios que podem ser deletados
    const getListaComHorariosParaDeletar = async () => {

        await getDadosLogin()
        
        const dados = {
            "codProfissional":profissionalId,
            "codSiasusSms":tipoAgenda,
            "dataSelecionada":data_selecionada,
            "tipVisualizacao":1,
            "indTeleatendimento":false,
            "indMobilidade":false,
            "session":FAST_SessionId
        }
        
        const response = await window.electron.getListaComHorariosParaDeletar(dados)
        return response
    }

    //GET USER BY CNS OU CPF
    const getUserIDByCNS = async (documento) => {
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
            return response?.CodUsuario
        }


        console.log("Documento: ", documento, "| ID: ", response?.CodUsuario)
        alert("Documento: " + documento + "| ID: " + response?.CodUsuario)
        return response?.CodUsuario
    }
    
    const getDadosLogin = async () => {
        const FAST_SessionId = await window.electron.getFastMedicSession()
        setFAST_SessionId(FAST_SessionId)
    }
    
    function getFastMedicSession() {
        window.electron.getFastMedicSession()
    }
    
    const consultarProfissionaisComAgendas = async () => {
        const dados = await window.electron.consultarProfissionaisComAgendas()
        setProfissionais(dados)
    }


    //GET OPCOES BLOQUEIO 
    const getOpcoesBloqueio = async () => {

        //MONTA A DATA EM FORMATO ISO, JA QUE O END POINT PEDE
        const [dia, mes, ano] = data_selecionada.split("/");
        const dataISO = new Date(
        `${ano}-${mes}-${dia}T00:00:00-03:00`
        ).toISOString();

        const dados = {
            "datConsulta":dataISO,
            "codProfissional":profissionalId,
            "codSiasusSms":tipoAgenda,
            "tipVisualizacao":1,
            "codAcaoOrigem":"32",
            "codGrupoEspecialidade":idCBOProfissional,
            "indTeleatendimento":false,
            "session":FAST_SessionId
        }

        const response = await window.electron.getOpcoesBloqueio(dados)
        console.log(response)

        setOpcoesBloqueio(response)
    }

    //BLOQUEAR ADM UM HORARIO
    const bloqueioADMUnico = async (codParametroAgenda, seqAgenda, codTipoAgendamento) => {
        
        const dados =
        [
            {
                "CodParametroAgenda":codParametroAgenda,
                "SeqAgenda":seqAgenda,
                "NumAnoCompetencia":new Date().getFullYear(),  // bruh; o request pede o ano por algum motivo
                "CodTipoAgendamento": codTipoAgendamento
            }
        ]

        await window.electron.bloqueioADMUnico(dados)
        //log
        const nomeProfissionalDonoDaAgenda = profissionais.find(agenda => agenda.value.split(",")[0] == profissionalId).texto.split(" - ")[0].trim()
        addRegister(dadosFormatados.unidade, dadosFormatados?.nome, nomeProfissionalDonoDaAgenda, "Bloqueio")

        await verificarHorariosDoDia()
    }




    
    const verificarHorariosDoDia = async () => {

        if (profissionalId == "") {
            alert("Selecione um profissional")
            return
        }

        console.log("Verificando horarios do dia " + data_selecionada)
        const dados = {
            "datConsulta": data_selecionada,
            "codProfissional": profissionalId,
            "codSiasusSms": tipoAgenda,
            "tipVisualizacao": 1,
            "codAcaoOrigem": "0",
            "codGrupoEspecialidade": idCBOProfissional,
            "indTeleatendimento": false,
            "indMobilidade": false,
            "session": FAST_SessionId
        }
        
        const resposta = await window.electron.verificarHorariosDoDia(dados)

        if (opcoesBloqueio.length === 0) {
            await getOpcoesBloqueio() // atualiza os bloqueios disponiveis
        }

        setHorarios(resposta)
    }



    
    useEffect(() => {
        async function carregar() {
            await getDadosLogin()
            const dados =
            await window.electron.consultarProfissionaisComAgendas();
            
            setProfissionais(dados);
            const dadosFormatados = await window.electron.getDadosFormatados()
            setDadosFormatados(dadosFormatados)
        }
        
        carregar();
    }, []);
    
    function selecionarProfissional(e) {
        const value = e.target.value;
        
        // Pega apenas o primeiro número
        const id = value.split(",")[0];
        const tipoAgenda = value.split(",")[1];
        const CBOProfissional = value.split(",")[2];
        
        setProfissionalId(id);
        setTipoAgenda(tipoAgenda);
        setIdCBOProfissional(CBOProfissional);
        
    }
    
    
    
    //cns 705408433308590 coduser 106780 name DONIZETI DE ALMEIDA
    
    
    
    
    return (
        <div className='container flex-center' style={{flexDirection: "column", justifyContent: "flex-start", paddingTop: 80}}>

        <HomeButton />


        {Object.entries(errosAgendamento).map(([seqAgenda, documento]) => {
            const horario = horarios?.find(
                h => String(h.seqAgenda) === String(seqAgenda)
            )

            return (
                <li key={seqAgenda}>
                    {horario?.hora} — CNS: {documento}
                </li>
            )
        })}

        <div className='configs flex-center' style={{}}> 
            
            
            
            
            <h1>Consultar Agendas</h1>

            {/* BOTOES */}
            {/* <button onClick={consultarProfissionaisComAgendas}>pagina consultar agendas</button> */}
            
            {/* metadados */}
            <div className='metadados'>
                Metadados:
                <p>ID Do Profissional: {profissionalId}</p>
                <p>Tipo Agenda: {tipoAgenda}</p>
                <p>CBO Profissional: {idCBOProfissional}</p>
                <button style={{transform: "scale(0.9)", display: "flex", justifyContent: "space-around", alignItems: "center" }} onClick={salvar}> <SaveAll /> Agendar Todos</button>
            </div>
            
            <div className='selectDias flex-center'>
                <button onClick={verificarHorariosDoDia}>Consultar Hórarios</button>
                
                <input className='inputData' type="date" value={data_selecionada.split("/").reverse().join("-")} onChange={(e) => {
                    const data = e.target.value; // yyyy-mm-dd
                    const [ano, mes, dia] = data.split("-");
                    setData_selecionada(`${dia}/${mes}/${ano}`);
                }}
                ></input>

                


            </div>

            <button type="button" onClick={() => inputPdfRef.current?.click()}>Importar PDF</button>
            <input
                ref={inputPdfRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={importarPdf}
                style={{ display: "none" }}
            />
                

            {/* SELECT DO PROFISSIONAL */}
            <select onChange={selecionarProfissional} className='selectProfissional'>
            <option style={{textAlign: "center"}} value="">SELECIONE O PROFISSIONAL</option>
            {profissionais.map((profissional) => (
                <option
                key={profissional.value}
                value={profissional.value}
                >
                {profissional.texto}    
                </option>
            ))}
            </select>

            
            {/* <button onClick={() => console.log(horarios)}>printar horarios no console</button> */}
            {/* <button onClick={() => getUserIDByCNS(704503385992918)}>Testar get userID pelo cns</button> */}
        </div>

        {/* -------------------------------------------------- */}
    
        <div className="horariosContainer">
            <p >Horarios: </p>
        {horarios &&
            horarios.map((horario, index) => (
                <motion.div
                    key={index}
                    className="horarioBlock"
                    initial={{
                        opacity: 0,
                        y: 80
                    }}
                    animate={{
                        opacity: 1,
                        y: 0
                    }}
                    transition={{
                        duration: 0.3,
                        delay: index * 0.08
                    }}
                >
                
                    {/* parte de cima do bloco */}
                    <div className="horarioHeader">

            {/* Horas */}
            <p id="horaConsulta" style={{ margin: 2 }}>
                {horario.hora}
            </p>

            {/* Usuario / bloqueio / input */}
            {horario.usuario ? (
                <p className="titulosBranco">{horario.usuario}</p>
            ) : horario.tipo ? (
                <p className="vagaBloqueada">Vaga bloqueada</p>
            ) : (
                <>
                    <input
                        value={Object.prototype.hasOwnProperty.call(cnsParaAgendar, horario.seqAgenda)
                            ? cnsParaAgendar[horario.seqAgenda]
                            : cnsPorHorario[horaDoHorario(horario)] || ""}
                        onFocus={() => {setInputAtivo(horario.seqAgenda)}}
                        onBlur={() => {setTimeout(() => setInputAtivo(null), 100)}}
                        onChange={(e) => {
                            setCnsParaAgendar((prev) => ({
                                ...prev,
                                [horario.seqAgenda]: e.target.value,
                            }));
                        }}
                    />

                    {/* BLOQUEIO ADM */}
                    <div className="bloqueio">
                        <label className="lockButton">
                            <LockKeyhole size={18} />

                            <select
                                onChange={(e) =>
                                    bloqueioADMUnico(
                                        horario.codParametroAgenda,
                                        horario.seqAgenda,
                                        e.target.value
                                    )
                                }
                            >
                                {opcoesBloqueio.map((bloqueio) => (
                                    <option
                                        key={bloqueio.value}
                                        value={bloqueio.value}
                                    >
                                        {bloqueio.text}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                </>

                
            )}


            

            {/* Deletar */}
            <button
                className="buttonDelete"
                onClick={() => {
                    console.log("ENVIADO:", horario.seqAgenda, horario.codParametroAgenda)
                    deletarAgendamentoUsuario(
                        horario.codParametroAgenda,
                        horario.seqAgenda,
                        ); 
                }}
            >
                <Trash2 size={18} />
            </button>


        </div>

                    <div className="horarioInfo">
                        <p>
                            <strong>Tipo:</strong> {horario.tipo || "—"}
                        </p>

                        <p>
                            <strong>Observação:</strong> {horario.observacao || "—"}
                        </p>
                    </div>
                    {
                        cnsParaAgendar[horario.seqAgenda] && !horario.usuario && inputAtivo === horario.seqAgenda &&
                        <AnimatePresence>
                            <ResultadosPesquisaModal 
                                busca={cnsParaAgendar[horario.seqAgenda]}  
                                seqAgenda={horario.seqAgenda} 
                                codParametroAgenda={horario.codParametroAgenda} 
                                agendar={agendarUsuarioPorCPFouCNS} 
                                refresh={verificarHorariosDoDia}
                            />
                        </AnimatePresence>
                    }
                </motion.div>
                
            )) || "Selecione o profissional e a data"}
                        

            
            </div>
            
            </div>
        )
    }