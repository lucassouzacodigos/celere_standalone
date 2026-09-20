import HomeButton from "../components/HomeButton";
import * as coletasControler from "../../services/AgendarColeta.js"
import { useEffect, useState } from "react";
import "../assets/main.css"







export default function AgendarColeta () {

    const [FAST_SessionId, setFAST_SessionId] = useState("")
    const [documento, setDocumento] = useState("")
    const [conselhoMedico, setConselhoMedico] = useState("")
    const [dataSelecionada, setDataSelecionada] = useState("")
    const [cnsParaAgendar, setCnsParaAgendar] = useState({})
    const [errosAgendamento, setErrosAgendamento] = useState({})


    const getDadosLogin = async () => {
        const FAST_SessionId = await window.electron.getFastMedicSession()
        setFAST_SessionId(FAST_SessionId)
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

            <div className="configs">

                <p>Selecionar Data</p>
                <input className='inputData' type="date" value={dataSelecionada.split("/").reverse().join("-")} onChange={(e) => {
                    const data = e.target.value; // yyyy-mm-dd
                    const [ano, mes, dia] = data.split("-");
                    setDataSelecionada(`${dia}/${mes}/${ano}`);
                }}
                ></input>

                <label>
                    <p>Conselho do Medico Solicitante</p>
                    <input className='inputData' type="text" placeholder="N° Do conselho solicitante" onChange={(e) => setConselhoMedico(e.target.value)}></input>
                </label>


                <p>Documento do Paciente</p>      
                <input className='inputData' type="text" placeholder="Documento" onChange={(e) => setDocumento(e.target.value)}></input>

                <button onClick={async() => console.log(await coletasControler.AgendarColetaDeExameGenerico(documento, conselhoMedico, dataSelecionada))}>Agendar coleta de exame genérico</button>


            </div> 


            {/* <div className="infoBlock flex-center">
                {cnsParaAgendar.length == 0 ? "Nenhum CNS foi digitado" : `CNS digitados: ${Object.values(cnsParaAgendar).join(", ")}`}
            </div> */}

            
            

            
        </div>
    )
}