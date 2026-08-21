import "../assets/main.css"
import { useEffect, useState } from 'react'

import HomeButton from '../components/HomeButton'
import ResultadosPesquisaModal from "../components/ResultadoPesquisaModal/ResultadosPesquisaModal"


export default function Testandopesquisa () {

    const [pesquisa, setPesquisa] = useState('')
    const [FAST_SessionId, setFAST_SessionId] = useState("")
    const [resultadoPesquisa, setResultadoPesquisa] = useState([])
    const [textoPdf, setTextoPdf] = useState("")



    //USE EFFECT DA PESQUISA
    useEffect(() => {
    const timer = setTimeout(() => {
        if (pesquisa.trim() !== "") {
        pesquisar()
        }
    }, 1000);

    return () => clearTimeout(timer);
    }, [pesquisa]);

    const getDadosLogin = async () => {
        const FAST_SessionId = await window.electron.getFastMedicSession()
        setFAST_SessionId(FAST_SessionId)
    }

    const pesquisar = async () => {
        await getDadosLogin()

        const dados = {
            "nomeUsuario":pesquisa,
            "nomeMae":"",
            "dataNascimento":"",
            "tipoPesquisa":0,
            "sortOption":{
                "Order":"desc"
            },
            "dscSexo":"",
            "idadeFinal":"",
            "idadeInicial":"",
            "session":FAST_SessionId
        }


        const response = await window.electron.buscaRecepcao(dados)
        console.log(response.length)
        setResultadoPesquisa(response)
    }


        const extrairTextoPdf = async (e) => {
            const file = e.target.files[0]

            if (!file) return

            const arrayBuffer = await file.arrayBuffer()
            const uint8Array = new Uint8Array(arrayBuffer)

            const resultado = await window.electron.extrairTextoPdf(uint8Array)

            setTextoPdf(resultado.texto)
            console.log(resultado.texto)
        }


    return(
        <div className='container flex-center'>

            <HomeButton />

            <input value={pesquisa} type="text" className="general-input" onChange={(e) => setPesquisa(e.target.value)} />
            <p>string pesquisa: {pesquisa}</p>
            <div style={{display: "flex", flexDirection: "column", overflowY: "auto", width: "80%"}}>
                {resultadoPesquisa.length > 0 ? 
                    resultadoPesquisa.map((user, index) => (
                        <div style={{display: "flex", flexDirection: "row", width: "100%", justifyContent: "space-around"}}>
                            <p key={index}>{user.CodUsuario} |</p>
                            <p>{user.NomUsuario}</p>
                            <p>{user.DatNascimento}</p>
                            <p>{user.DscIdade}</p>
                            <p>{user.DscLogradouro}</p>
                            <p>{user.IdadeAnos}</p>
                            <p>{user.NumCartaoSaude}</p>
                            <p>{user.NumCPF}</p>
                        </div>
                    ))
                    :
                    <p>sem resultados</p>
                }
                <input type="file" accept=".pdf,application/pdf" onChange={extrairTextoPdf}></input>
                <textarea style={{minHeight:500}}>{textoPdf}</textarea>
            </div>

            <ResultadosPesquisaModal />
        </div>
    )
}