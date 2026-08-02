import { useNavigate } from "react-router-dom"
import "../assets/main.css"
import { useEffect, useState } from 'react'
import casinha from "../assets/home.png"
import HomeButton from "../components/HomeButton"
import DatePicker from "react-datepicker"
import 'react-datepicker/dist/react-datepicker.css'


export default function ConsultarAgendas() {
    const navigate = useNavigate()
    const [profissionais, setProfissionais] = useState([]);
    const [profissionalId, setProfissionalId] = useState("");
    const [tipoAgenda, setTipoAgenda] = useState("");
    const [idCBOProfissional, setIdCBOProfissional] = useState("");
    const [horarios, setHorarios] = useState();
    const [FAST_SessionId, setFAST_SessionId] = useState("")
    const [data_selecionada, setData_selecionada] = useState("")
    const [cidadaoID, setCidadaoID] = useState("")
    const [cnsParaAgendar, setCnsParaAgendar] = useState({})
    
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));



    const salvar = async () => {
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
};

    const agendarUsuarioPorCPFouCNS = async (documento, seqAgenda, codParametroAgenda) => {


        const IDCidadao = await getUserIDByCNS(documento)
        await getDadosLogin()

        const dados = {
            "codUsuario": IDCidadao,  //ID do cidadao pra ser agendado
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


        const response = await window.electron.agendarUsuarioPorCPFouCNS(dados)

        if (response.sucesso) {
            console.log("Agendado com sucesso")
        } else {
            console.log("Erro ao agendar")
        }

    }
    
    const getUserIDByCNS = async (documento) => {
        const dados = {
            "numeroCartaoSaude":documento,
            "tipoPesquisa":0,
            "session":FAST_SessionId
        }
        
        const response = await window.electron.getUserIDByCNS(dados)
        console.log("Documento: ", documento, "| ID: ", response?.CodUsuario)
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
    
    const verificarHorariosDoDia = async () => {
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
        
        setHorarios(resposta)
    }
    
    useEffect(() => {
        async function carregar() {
            await getDadosLogin()
            const dados =
            await window.electron.consultarProfissionaisComAgendas();
            
            setProfissionais(dados);
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
        <div className='container flex-center'>
        <HomeButton />
        
        <p>ID Do Profissional: {profissionalId}</p>
        <p>Tipo Agenda: {tipoAgenda}</p>
        <p>CBO Profissional: {idCBOProfissional}</p>
        
        <select onChange={selecionarProfissional} className='selectProfissional'>
        {profissionais.map((profissional) => (
            <option
            key={profissional.value}
            value={profissional.value}
            >
            {profissional.texto}    
            </option>
        ))}
        </select>
        
        <h1>Consultar Agendas</h1>

        {/* BOTOES */}
        {/* <button onClick={consultarProfissionaisComAgendas}>pagina consultar agendas</button> */}
        <button onClick={verificarHorariosDoDia}>Consultar horarios de um dia especifico</button>
        



        <input type="date" onChange={(e) => {
            const data = e.target.value; // yyyy-mm-dd
            const [ano, mes, dia] = data.split("-");
            setData_selecionada(`${dia}/${mes}/${ano}`);
        }}
        ></input>

        <button onClick={salvar}>Agendar Todos</button>
        {/* <button onClick={() => console.log(horarios)}>printar horarios no console</button> */}
        {/* <button onClick={() => getUserIDByCNS(700002485791400)}>Testar get userID pelo cns</button> */}
        
        <div style={{ display: "flex", flexDirection: "column", overflowY: "auto" }}>
        {horarios &&
            horarios.map((horario, index) => (
                <div key={index} className="flex-center horarioBlock" >
                
                    {/* parte de cima do bloco */}
                    <div style={{ display: "flex", flexDirection: "row", width: "100%", alignItems: "center" }}>

                        {/* Horas, todo bloco vai ter, independente */}
                        <p id='horaConsulta' style={{ margin: 2 }}>{horario.hora}</p>

                        {/* Usuario na frente da hora */}
                        {horario.usuario 
                        ? ( <p className="titulosBranco">{horario.usuario}</p>) 
                        : horario.tipo ? (<p style={{ margin: 2 }}>{"Vaga bloqueada"}</p>) 
                        : (
                            <input
                            value={cnsParaAgendar[horario.seqAgenda] || ""}
                            onChange={(e) => {
                                setCnsParaAgendar((prev) => ({
                                    ...prev,
                                    [horario.seqAgenda]: e.target.value,
                                }))}
                            }
                            />
                        )}
                    </div>

                    
                
                <p style={{ margin: 2 }}>{horario.tipo}</p>
                <p style={{ margin: 2 }}>{horario.observacao}</p>
                </div>
            ))}
            </div>
            
            </div>
        )
    }