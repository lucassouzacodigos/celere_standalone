import HomeButton from "../components/HomeButton";
import * as coletasControler from "../../services/AgendarColeta.js"
import { useEffect, useRef, useState } from "react";
import "../assets/main.css"
import ItemEsperandoColeta from "../components/ItemEsperandoColeta.jsx";







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

    const handleAgendamento = async (directDoc) => {

        try {
            const response = await coletasControler.AgendarColetaDeExameGenerico(directDoc || documento, conselhoMedico, dataSelecionada)
            reloadListaDeColetas()
            setTempErro(false)
            return response
        } catch (err) {
            console.log(err)
            console.log("Erro ao agendar paciente")
            setTempErro(true)
        }
        // console.log("response", response)

    }




    const reloadListaDeColetas = async () => {
        const listaDeColetas = await coletasControler.getAgendaDeColetasDia(dataSelecionada)
        setListaDeColetas(listaDeColetas)
    }

    const importarPdf = async (event) => {

        //ALERTA

        const file = event.target.files[0]
        event.target.value = ""
        if (!file) return

        setNomeArquivoPdf(file.name)
        setErroPdf("")
        setListaCnsPdf("")

        try {
            const arrayBuffer = await file.arrayBuffer()
            const resultado = await window.electron.extrairTextoPdf(new Uint8Array(arrayBuffer))

            if (!resultado?.sucesso) {
                throw new Error(resultado?.erro || "Não foi possível extrair o texto do PDF.")
            }

            if (typeof resultado.texto !== "string") {
                throw new Error("O PDF não retornou texto para leitura.")
            }

            const textoPdf = resultado.texto.replace(/\r/g, "")
            const correspondenciaData = textoPdf.match(/Data:\s*(\d{2})\/(\d{2})\/(\d{4})/i)
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

            const cnsEncontrados = [...textoPdf.matchAll(/(?:^|\n)\s*(\d{2}:\d{2})\s+([^\n]+)[\s\S]*?(?=\n\s*\d{2}:\d{2}\s|$)/g)]
                .map((bloco) => {
                    return {
                        nome: bloco[2].split(/\s+\(/)[0].trim(),
                        cns: bloco[0].match(/CNS\s*:\s*(\d{15})/i)?.[1] || "Nao informado",
                    }
                })
            const cnsUnicos = cnsEncontrados.filter((paciente, index, pacientes) =>
                paciente.cns === "Nao informado" ||
                pacientes.findIndex((item) => item.cns === paciente.cns) === index
            )
            console.log(cnsUnicos)

            if (cnsUnicos.length === 0) {
                throw new Error("Nenhum CNS foi encontrado no PDF.")
            }
            cnsUnicos.sort((a, b) => a.nome.localeCompare(b.nome))
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

            <div className="configs" style={{minHeight: "auto", display: "flex", flexDirection: "row", justifyContent: "start", alignItems: "start", padding: 10}}>


                {/* botao master */}
                <button onClick={handleAgendamento}
                    style={{width: 150, margin:10, height: "85%"}}
                >Agendar coleta de exame genérico</button>
                


                <div className='divisorItemColeta'>
                    <p >Selecionar Data</p>
                    <input className='inputData' type="date" value={dataSelecionada.split("/").reverse().join("-")} onChange={async(e) => {
                        const data = e.target.value; // yyyy-mm-dd
                        const [ano, mes, dia] = data.split("-");
                        const dataFormatada = `${dia}/${mes}/${ano}`
                        setDataSelecionada(dataFormatada);
                        const listaDeColetas = await coletasControler.getAgendaDeColetasDia(dataFormatada)
                        setListaDeColetas(listaDeColetas)
                    }}
                    ></input>
                </div>

                <div className='divisorItemColeta'>
                    <p >Conselho do Medico Solicitante</p>
                    <input className='inputData' type="text" placeholder="N° Do conselho solicitante" onChange={(e) => setConselhoMedico(e.target.value)}></input>
                </div>




                <div className='divisorItemColeta'>
                    <p>Status: {tempErro ? <span style={{fontWeight:"bold", color:"red"}}>CNS Nao encontrado</span> : <span style={{fontWeight:"bold", color:"green"}}>OK</span>}</p>
                    <p>Documento do Paciente</p>
                    <input className='inputData' type="text" placeholder="Documento" onChange={(e) => setDocumento(e.target.value)}></input>
                    
                    
                    
                    <input
                        ref={inputPdfRef}
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={importarPdf}
                        style={{display: "none"}}
                    />

                    

                </div>

                <div className='divisorItemColeta'>
                    <button
                        type="button"
                        onClick={() => {
                            const confirmar = window.confirm(`
!!!IMPORTANTE!!!

Tenha bastante cuidado ao usar essa função.
Importe seu PDF apenas uma vez.

Toda vez que um PDF é importado, ele solicita automaticamente
a coleta de material para todos os pacientes encontrados.

Se importar o mesmo PDF novamente, poderá solicitar exames
duplicados para os mesmos pacientes.

Não precisa selecionar a data, pois ela será extraída do PDF.

CRM atual: ${conselhoMedico === "" ? "*NAO INFORMADO*" : conselhoMedico}

Se ainda não informou o CRM do médico solicitante,
cancele a seleção do arquivo antes de importar.
Caso contrário, ele será agendado para o médico com ID 1.
                            `);

                            if (confirmar) {
                                inputPdfRef.current?.click();
                            }
                        }}
                    >
                        Importar CNSs de PDF
                    </button>
                </div>
                

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

                

                <div className="configs flex-center" style={{flexDirection: "column", justifyContent: "flex-start", overflowY: "auto", height: "100%", padding: 10, wdith: "45%"}}>
                    {
                        listaCnsPdf.length == 0 ? "Aguardando Pdf" : 
                        listaCnsPdf.map((entry, index) => {
                            return(
                                <ItemEsperandoColeta key={`${entry.nome}-${entry.cns}-${index}`} nome={entry.nome} cns={entry.cns} agendarColetaGenerica={handleAgendamento} />
                            )
                        })
                    }
                </div>


            </div>

            

            


            
        </div>
    )
}