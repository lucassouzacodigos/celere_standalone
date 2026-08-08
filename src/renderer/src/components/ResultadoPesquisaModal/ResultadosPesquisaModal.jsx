
import { useEffect, useState } from "react"
import "./modal.css"
import { motion } from "motion/react"


import Spinner from "../Spinner"


export default function ResultadosPesquisaModal({ busca, agendar, seqAgenda, codParametroAgenda, refresh }) {

    const [pesquisa, setPesquisa] = useState('')
    const [FAST_SessionId, setFAST_SessionId] = useState("")
    const [resultadoPesquisa, setResultadoPesquisa] = useState([])



    useEffect(() => {
        const timer = setTimeout(() => {
            if (busca.trim() !== "") {
            pesquisar()
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [busca]);




    const getDadosLogin = async () => {
        const FAST_SessionId = await window.electron.getFastMedicSession()
        setFAST_SessionId(FAST_SessionId)
    }



    const pesquisar = async () => {
        await getDadosLogin()

        const dados = {
            "nomeUsuario":busca,
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

    const agendamentoIndividual = async (id) => {
        await agendar(undefined, seqAgenda, codParametroAgenda, id)
        refresh()
    }



    return (
        <motion.div className='pesquisaModalContainer'
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
                    }}
                    exit={{
                        opacity: 0,
                        y: 80
                    }}
        >
            
            <div style={{display: "flex", flexDirection: "column", overflowY: "auto", width: "100%", backgroundColor: "white"}}>
                {resultadoPesquisa.length > 0 ? 
                    resultadoPesquisa.map((user, index) => (
                        <div key={index} className='linhaResultado' onClick={() => agendamentoIndividual(user.CodUsuario)}>
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
                <Spinner />
                }
            </div>
        </motion.div>
    )
}