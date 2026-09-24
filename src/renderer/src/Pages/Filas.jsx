import HomeButton from "../components/HomeButton";
import * as coletasControler from "../../services/AgendarColeta.js"
import * as filaControler from "../../services/FilaControler.js"
import { useEffect, useState } from "react";
import "../assets/main.css"




export default function Filas(){

    
    const [teste, setTeste] = useState()
    const [filas, setFilas] = useState([])
    const [filaAtualRender, setFilaAtualRender] = useState({})

    //roda toda vez que a pagina carrega
    useEffect(() => {
        async function init() {
            const filas = await filaControler.getFilasPage();
            setFilas(filas);
            console.log(filas)
        }

        init();
        console.log("filas");
    }, []);


    //roda ao clicar em uma fila
    const handleFilaSelection = async (filaSelecionada) => {
        const response = await filaControler.getPacientesFila(filaSelecionada)
        console.log(response)
        setFilaAtualRender(response)
    }




    return(
        <div className="container flex-center" style={{flexDirection: "row", justifyContent: "flex-start", paddingTop: 80}}>
            <HomeButton/>

            {/* FILAS */}
            <div className="configs filas" style={{height: "90%", width: "30%",  margin:10, overflowY: "auto", border: "1px solid green"}}>
                {filas.length > 0 ? filas.map(
                    (fila, __index) => {
                        return(
                            <div key={__index} className="filaItem" style={{}} onClick={() => handleFilaSelection(fila)}>
                                <p>{fila.DscAcao}</p>
                                <p>{fila.QtdUsuario}</p>
                            </div>
                        )
                    }
                ) : "carregando"}

            </div>

            <button onClick={async() => filaControler.tirarDaFila()}></button>

            {/* CONTEUDO FILAS */}
            <div className="configs filas" style={{height: "90%", width: "70%",  margin:5, overflowY: "auto", border: "1px solid green"}}>
                {filaAtualRender.length > 0 ? filaAtualRender.map(
                    (paciente, idx) => {
                        const prio = paciente.CorPriorizacaoFila?.split(":")[1]?.replace(";", "50")
                        const elementosNome = paciente.NomUsuario.split("-")
                        return(
                            <div className="itemHover" key={idx} style={{flexDirection:"row"}}>
                                <div style={{backgroundColor: prio ?? "#7070704b", margin:5, borderRadius:5, padding:5, fontWeight: "bold", color: "#ffffffc9", display: "flex", flexDirection:"row"}} >
                                    {/* {elementosNome.map(
                                        (elemento, idx) => {
                                            return(
                                                <div>
                                                    <span key={idx} style={{backgroundColor: "red", margin:5}}>{elemento}</span>
                                                </div>
                                            )
                                        }
                                    )} */}
                                    <span style={{marginLeft: 5, backgroundColor: "", width: "45%", alignSelf: "center"}}>{elementosNome[0]}</span>
                                    <span style={{margin: 5, backgroundColor: "", width: "auto", alignSelf: "center"}}>{elementosNome[1]??"|"}</span>
                                    <span style={{marginLeft: 5, backgroundColor: "", width: "20%", alignSelf: "center"}}>{elementosNome[2]??"|"}</span>
                                    <span style={{marginLeft: 5, backgroundColor: "", width: "10%", alignSelf: "center"}}>{elementosNome[3]??""}</span>
                                    {elementosNome[4] && <span style={{marginLeft: 5, backgroundColor: "", width: "auto", }}>{elementosNome[4]}</span>}
                                    {elementosNome[5] && <span style={{marginLeft: 5, backgroundColor: "", width: "auto"}}>{elementosNome[5]}</span>}
                                </div>
                            </div>
                        )
                    }
                ) : "Carregando...."}
            </div>
                


        </div>
    )
}