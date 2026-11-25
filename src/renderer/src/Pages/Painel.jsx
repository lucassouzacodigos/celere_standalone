


import '../assets/main.css'
import * as painelControler from "../../services/painelControler.js"
import { useState } from 'react'
import HomeButton from '../components/HomeButton'


export default function Painel(){

    const [dadosPainel, setDadosPainel] = useState([])


    const handlePing = async () => {
        const response = await painelControler.ping()
        setDadosPainel(response)
        console.log(response)
    }

    const handleAtualizaTempoEspera = async () => {
        const response = await painelControler.atualizaTempoEspera()
        setDadosPainel(response)
        console.log(response)
    }

    const handleValidaGrid = async () => {
        const response = await painelControler.validaGrid()
        setDadosPainel(response)
        console.log(response)
    }

    const handleAtualizaChamadas = async () => {
        const response = await painelControler.atualizaChamadas()
        setDadosPainel(response)
        console.log(response)
    }

    return(
        <div className='container'>
            <HomeButton/>
            container
            <button onClick={handlePing}>att infos painel?</button>
            <button onClick={handleAtualizaTempoEspera}>atualizatempoespera</button>
            <button onClick={handleValidaGrid}>validagrid</button>
            <button onClick={handleAtualizaChamadas}>atualizachamadas</button>

            <div className='painelContent'>

                <div className='painelHeader'>

                    <div className='painelBody'>
                        
                        {
                            dadosPainel.length > 0 ?
                            dadosPainel.map((itemListaChamadas, idx) => {
                                return(
                                    <div key={idx}>
                                        <p>{itemListaChamadas.NomeUsuario}</p>
                                        <button onClick={async()=> await painelControler.falarPaciente(itemListaChamadas.NomeUsuario, itemListaChamadas.DscSiglaSala)}>chamar</button>
                                    </div>
                                )
                            }) :
                            "nada ainda"
                        }

                    </div>

                </div>

            </div>




        </div>
    )

}