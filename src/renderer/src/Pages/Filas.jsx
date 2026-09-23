import HomeButton from "../components/HomeButton";
import * as coletasControler from "../../services/AgendarColeta.js"
import * as filaControler from "../../services/FilaControler.js"
import { useEffect, useState } from "react";
import "../assets/main.css"




export default function Filas(){

    
    const [teste, setTeste] = useState()
    const [filas, setFilas] = useState([])
    const [filaSelecionada, setFilaSelecionada] = useState({})

    useEffect(() => {
        async function init() {
            const filas = await filaControler.getFilasPage();
            setFilas(filas);
        }

        init();
        console.log("filas");
    }, []);




    return(
        <div className="container flex-center" style={{flexDirection: "row", justifyContent: "flex-start", paddingTop: 80}}>
            <HomeButton/>

            {/* FILAS */}
            <div className="configs filas" style={{height: "90%", width: "30%",  margin:10, overflowY: "auto"}}>
                {filas.length > 0 ? filas.map(
                    (fila) => {
                        return(
                            <div className="filaItem" style={{}} onClick={()=> filaControler.getPacientesFila(fila)}>
                                <p>{fila.DscAcao}</p>
                            </div>
                        )
                    }
                ) : "carregando"}

            </div>

            {/* CONTEUDO FILAS */}
            <div className="configs filas">
                afeaifj
            </div>
                


        </div>
    )
}