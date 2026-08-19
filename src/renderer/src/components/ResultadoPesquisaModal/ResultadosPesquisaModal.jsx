
import { useEffect, useState } from "react"
import "./modal.css"
import { motion } from "motion/react"


import Spinner from "../Spinner"


export default function ResultadosPesquisaModal({ busca, agendar, seqAgenda, codParametroAgenda, refresh }) {

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
            
            <div className="resultadosPesquisaLista">
                {resultadoPesquisa.length > 0 ? 
                    resultadoPesquisa.map((user, index) => (
                        <button
                            key={index}
                            type="button"
                            className="linhaResultado"
                            onClick={() => agendamentoIndividual(user.CodUsuario)}
                        >
                            <span className="resultadoResumo">
                                <span className="resultadoCodigo">#{user.CodUsuario}</span>
                                <span className="resultadoNome">{user.NomUsuario || "Nome não informado"}</span>
                                <span className="resultadoNascimento">{user.DatNascimento || "Nascimento não informado"}</span>
                                <span className="resultadoAcao">Selecionar</span>
                            </span>
                            <span className="resultadoDetalhes">
                                <span><small>Idade</small>{user.DscIdade || user.IdadeAnos || "Não informada"}</span>
                                <span><small>Endereço</small>{user.DscLogradouro || "Não informado"}</span>
                                <span><small>Cartão SUS</small>{user.NumCartaoSaude || "Não informado"}</span>
                                <span><small>CPF</small>{user.NumCPF || "Não informado"}</span>
                            </span>
                        </button>
                    ))
                    :
                <Spinner />
                }
            </div>
        </motion.div>
    )
}