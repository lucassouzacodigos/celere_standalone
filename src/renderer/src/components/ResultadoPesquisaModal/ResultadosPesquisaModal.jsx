
import { useEffect, useRef, useState } from "react"
import "./modal.css"
import { motion } from "motion/react"


import Spinner from "../Spinner"


export default function ResultadosPesquisaModal({ busca, agendar, seqAgenda, codParametroAgenda, refresh, horaAgendado }) {

    const [resultadoPesquisa, setResultadoPesquisa] = useState([])
    const FAST_SessionId = useRef("")



    useEffect(() => {
        window.electron.getFastMedicSession().then((sessionId) => {
            FAST_SessionId.current = sessionId || ""
        })
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => {
            if (busca.trim().length >= 3 && busca.includes(" ")) {
                pesquisar(busca.trim())
            } else {
                setResultadoPesquisa([])
            }
        }, 450)

        return () => clearTimeout(timer)
    }, [busca])


    const pesquisar = async (nomeUsuario) => {

        const dados = {
            "nomeUsuario":nomeUsuario,
            "nomeMae":"",
            "dataNascimento":"",
            "tipoPesquisa":0,
            "sortOption":{
                "Order":"desc"
            },
            "dscSexo":"",
            "idadeFinal":"",
            "idadeInicial":"",
            "session":FAST_SessionId.current
        }


        const response = await window.electron.buscaRecepcao(dados)
        console.log(response.length)
        setResultadoPesquisa(response)
    }

    const agendamentoIndividual = async (usuario) => {
        console.log("usuario", usuario)
        await agendar(usuario.NumCartaoSaude, seqAgenda, codParametroAgenda, usuario.CodUsuario, horaAgendado)
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
                            onClick={() => agendamentoIndividual(user)}
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
                    <div className="linhaResultado" style={{display:"flex", flexDirection:"row", justifyContent:"space-evenly", alignItems:"center", marginTop:0, height:45}}>
                        <span className="resultadoCodigo">#000000</span>
                        <Spinner /> <p><strong>Para pesquisar digite pelo menos 3 letras, um nome e sobrenome</strong></p>
                    </div>
                    
                }
            </div>
        </motion.div>
    )
}