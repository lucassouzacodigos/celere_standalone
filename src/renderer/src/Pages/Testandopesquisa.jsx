import "../assets/main.css"
import { useEffect, useState } from 'react'

import HomeButton from '../components/HomeButton'


export default function Testandopesquisa () {

    const [pesquisa, setPesquisa] = useState('')
    const [FAST_SessionId, setFAST_SessionId] = useState("")
    const [resultadoPesquisa, setResultadoPesquisa] = useState([])



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


    return(
        <div className='container flex-center'>

            <HomeButton />

            <input value={pesquisa} type="text" className="general-input" onChange={(e) => setPesquisa(e.target.value)} />
            <p>string pesquisa: {pesquisa}</p>
            <div style={{display: "flex", flexDirection: "column", overflowY: "auto", width: "100%"}}>
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
            </div>
        </div>
    )
}