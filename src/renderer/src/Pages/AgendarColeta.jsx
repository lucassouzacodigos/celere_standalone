import HomeButton from "../components/HomeButton";
import * as coletasControler from "../../services/AgendarColeta.js"
import { useEffect, useState } from "react";








export default function AgendarColeta () {

    const [FAST_SessionId, setFAST_SessionId] = useState("")
    const [documento, setDocumento] = useState("")
    const [conselhoMedico, setConselhoMedico] = useState("")


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

            
            <button onClick={async() => console.log(await coletasControler.iniciarProcessoAgendamentoColeta(1))}>insert procedimentos</button>
            <button onClick={async() => console.log(await coletasControler.getDadosDoutor(1234))}>get doutor</button>
            <button onClick={async() => console.log(await coletasControler.getDadosPaciente())}>get poaciente</button>
            <button onClick={async() => await coletasControler.AgendarColetaDeExameGenerico(1, 1234)}>agendar coleta</button>
 

        </div>
    )
}