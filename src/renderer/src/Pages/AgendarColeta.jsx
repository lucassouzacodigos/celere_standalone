import HomeButton from "../components/HomeButton";
import * as coletasControler from "../../services/AgendarColeta.js"
import { useEffect, useRef, useState } from "react";
import "../assets/main.css"







export default function AgendarColeta () {

    const [FAST_SessionId, setFAST_SessionId] = useState("")
    const [documento, setDocumento] = useState("")
    const [conselhoMedico, setConselhoMedico] = useState("")
    const [dataSelecionada, setDataSelecionada] = useState("")
    const [cnsParaAgendar, setCnsParaAgendar] = useState({})
    const [errosAgendamento, setErrosAgendamento] = useState({})
    const [listaDeColetas, setListaDeColetas] = useState([])
    const [tempErro, setTempErro] = useState(false)
    const [listaCnsPdf, setListaCnsPdf] = useState([])
    const [nomeArquivoPdf, setNomeArquivoPdf] = useState("")
    const [erroPdf, setErroPdf] = useState("")
    const inputPdfRef = useRef(null)


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

    const importarPdf = async (event) => {
        const file = event.target.files[0]
        event.target.value = ""
        if (!file) return

        setNomeArquivoPdf(file.name)
        setErroPdf("")

        try {
            const arrayBuffer = await file.arrayBuffer()
            const resultado = await window.electron.extrairTextoPdf(new Uint8Array(arrayBuffer))

            if (!resultado?.sucesso) {
                throw new Error(resultado?.erro || "Não foi possível extrair o texto do PDF.")
            }

            if (typeof resultado.texto !== "string") {
                throw new Error("O PDF não retornou texto para leitura.")
            }

            const correspondenciaData = resultado.texto.match(/Data:\s*(\d{2})\/(\d{2})\/(\d{4})/i)
            let dataPdf = ""
            if (correspondenciaData) {
                const [, dia, mes, ano] = correspondenciaData
                const dataValidada = new Date(Number(ano), Number(mes) - 1, Number(dia))
                if (
                    dataValidada.getFullYear() === Number(ano) &&
                    dataValidada.getMonth() === Number(mes) - 1 &&
                    dataValidada.getDate() === Number(dia)
                ) {
                    dataPdf = `${dia}/${mes}/${ano}`
                }
            }

            const cnsEncontrados = [...resultado.texto.matchAll(/CNS\s*:\s*(\d{15})/gi)]
                .map((match) => match[1])
            const cnsUnicos = [...new Set(cnsEncontrados)]
            console.log(cnsUnicos)

            if (cnsUnicos.length === 0) {
                throw new Error("Nenhum CNS foi encontrado no PDF.")
            }
            setListaCnsPdf(cnsUnicos)
            if (dataPdf) {
                setDataSelecionada(dataPdf)
            } else {
                setErroPdf("CNSs importados, mas não foi encontrada uma data válida no PDF.")
            }
        } catch (error) {
            console.error("Erro ao importar CNSs do PDF:", error)
            setErroPdf(error.message || "Não foi possível importar os CNSs do PDF.")
        }
        
    }




    useEffect(() => {
        async function init() {
            await getDadosLogin()
            console.log(listaDeColetas)
        }
        init()
    }, [])




    return(

        <div className='container flex-center' style={{flexDirection: "column", justifyContent: "flex-start", paddingTop: 80}}>
            <HomeButton/>

            <div className="configs" style={{minHeight: 350}}>

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
                
                <input
                    ref={inputPdfRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={importarPdf}
                    style={{display: "none"}}
                />
                {/* <button type="button" onClick={() => inputPdfRef.current?.click()}>
                    Importar CNSs de PDF
                </button> */}
            </div> 


            {/* PARTE INFERIOR CONTAINER */}
            <div className="infoBlock flex-center" style={{flexDirection: "row", justifyContent: "flex-start", height: "auto", backgroundColor:""}}>

                <div className="configs flex-center" style={{flexDirection: "column", justifyContent: "flex-start", overflowY: "auto", height: "100%", padding: 10, wdith: "45%"}}>
                    {
                        listaDeColetas.length == 0 ? 
                        "Ninguem agendado" : 
                        listaDeColetas.map((paciente) => {
                            const [nome, sexo, dtNasc] = paciente.title.split("-")
                            const idade = paciente.title.split("-")[3].split("(")[0]//splitando string da idade remove a ultima palavra


                            return(
                                <div key={paciente.CodUsuario} className="ListaColetaItem" >
                                    {nome} 
                                    <span style={{backgroundColor:"rgba(82, 243, 144, 0.33)", borderRadius: 5, paddingLeft:10, paddingRight:10}}>
                                        {idade}
                                    </span>
                                </div>
                            )
                            
                        })
                    }

                </div>

                {/* <div className="configs flex-center" style={{flexDirection: "column", justifyContent: "flex-start", overflowY: "auto", height: "100%", padding: 10, wdith: "45%", backgroundColor:"green"}}>
                    
                </div> */}


            </div>

            

            


            
        </div>
    )
}