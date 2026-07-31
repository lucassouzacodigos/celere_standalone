import { useNavigate } from "react-router-dom"
import "../assets/main.css"
import { useEffect, useState } from 'react'

export default function ConsultarAgendas() {
    const navigate = useNavigate()
    const [profissionais, setProfissionais] = useState([]);
    const [profissionalId, setProfissionalId] = useState("");
    const [tipoAgenda, setTipoAgenda] = useState("");
    const [idCBOProfissional, setIdCBOProfissional] = useState("");
    const [horarios, setHorarios] = useState();
    const [FAST_SessionId, setFAST_SessionId] = useState("")
    const [data_selecionada, setData_selecionada] = useState("")
    



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
        console.log("teste")
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
    
    
    
    
    return (
        <div className='container'>
            <div className='go-to-home-btn' onClick={() => navigate('/Home')}></div>

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

            <button onClick={consultarProfissionaisComAgendas}>pagina consultar agendas</button>
            <button onClick={verificarHorariosDoDia}>Consultar horarios de um dia especifico</button>
            <input type="date" onChange={(e) => setData_selecionada(e.target.value)}></input>
            <button onClick={() => console.log(horarios)}>printar horarios</button>

            <div style={{display:"flex", flexDirection:"column", overflowY:'auto'}}>
                {horarios && horarios.map((horario) => (
                    <div style={{border: "1px solid black", display:"flex", flexDirection:"row", margin:10, padding: 10}}>
                        <p style={{margin:2}}>{horario.hora}</p>
                        <p style={{margin:2}}>{horario.usuario || "SEM USUARIO CADASTRADO"}</p>
                        <p style={{margin:2}}>{horario.tipo}</p>
                        <p style={{margin:2}}>{horario.observacao}</p>
                        <p style={{margin:2}}>{horario.horaConsulta}</p>
                        <p style={{margin:2}}>{horario.horaComparecimento}</p>
                        
                    </div>
                ))}
            </div>
        
        </div>
    )
}