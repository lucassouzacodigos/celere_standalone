import HomeButton from "../components/HomeButton";
import * as coletasControler from "../../services/AgendarColeta.js"
import { useEffect, useState } from "react";
import "../assets/main.css"
import { MapPinHouse } from "lucide-react";







export default function AgendarColeta () {

    const [FAST_SessionId, setFAST_SessionId] = useState("")
    const [documento, setDocumento] = useState("")
    const [conselhoMedico, setConselhoMedico] = useState("")
    const [dataSelecionada, setDataSelecionada] = useState("")
    const [cnsParaAgendar, setCnsParaAgendar] = useState({})
    const [errosAgendamento, setErrosAgendamento] = useState({})
    const [listaDeColetas, setListaDeColetas] = useState([])
    const [tempErro, setTempErro] = useState(false)


    const getDadosLogin = async () => {
        const FAST_SessionId = await window.electron.getFastMedicSession()
        setFAST_SessionId(FAST_SessionId)
    }

    const handleAgendamento = async () => {
        try {
            await coletasControler.AgendarColetaDeExameGenerico(documento, conselhoMedico, dataSelecionada)
            reloadListaDeColetas()
            setTempErro(false)
        } catch (err) {
            console.log("Erro ao agendar paciente")
            setTempErro(true)
        }
    }




    const reloadListaDeColetas = async () => {
        const listaDeColetas = await coletasControler.getAgendaDeColetasDia(dataSelecionada)
        setListaDeColetas(listaDeColetas)
    }




    useEffect(() => {
        async function init() {
            await getDadosLogin()
        }
        init()
    }, [])




    return(

        <div className='container flex-center' style={{flexDirection: "column", justifyContent: "flex-start", paddingTop: 80}}>
            <HomeButton/>

            <div className="configs" style={{height: "auto", backgroundColor:""}}>

                <p>Selecionar Data</p>
                <input className='inputData' type="date" value={dataSelecionada.split("/").reverse().join("-")} onChange={async(e) => {
                    const data = e.target.value; // yyyy-mm-dd
                    const [ano, mes, dia] = data.split("-");
                    const dataFormatada = `${dia}/${mes}/${ano}`
                    setDataSelecionada(dataFormatada);

                    const listaDeColetas = await coletasControler.getAgendaDeColetasDia(dataFormatada)
                    setListaDeColetas(listaDeColetas)

                }}
                ></input>

                <label>
                    <p>Conselho do Medico Solicitante</p>
                    <input className='inputData' type="text" placeholder="N° Do conselho solicitante" onChange={(e) => setConselhoMedico(e.target.value)}></input>
                </label>




                <p>Documento do Paciente</p>    
                <p>Status: {tempErro ? <span style={{fontWeight:"bold", color:"red"}}>CNS Nao encontrado</span> : <span style={{fontWeight:"bold", color:"green"}}>OK</span>}</p>  
                <input className='inputData' type="text" placeholder="Documento" onChange={(e) => setDocumento(e.target.value)}></input>
                <button onClick={handleAgendamento}>Agendar coleta de exame genérico</button>

            </div> 


            {/* <div className="infoBlock flex-center">
                {cnsParaAgendar.length == 0 ? "Nenhum CNS foi digitado" : `CNS digitados: ${Object.values(cnsParaAgendar).join(", ")}`}
            </div> */}

            
            <div className="configs flex-center" style={{flexDirection: "column", justifyContent: "flex-start", overflowY: "auto", height: "50%", padding: 10, wdith: "100%"}}>
                {
                    listaDeColetas.length == 0 ? 
                    "Ninguem agendado" : 
                    listaDeColetas.map((paciente) => {
                        return(
                            <div key={paciente.CodUsuario} className="ListaColetaItem" >
                                {paciente.title.slice(0, -11).replace("(Masculino)", "").replace("(Feminino)", "").replace("-", "")}
                            </div>
                        )
                        
                    })
                }

            </div>

            
        </div>
    )
}