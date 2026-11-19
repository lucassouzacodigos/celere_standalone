
import "../assets/main.css"
import { CircleX, CircleCheck, SquareX, SquareCheck, TriangleAlert } from "lucide-react"
import Spinner from "./Spinner"
import { useEffect, useState } from "react"




export default function ItemEsperandoColeta({nome, cns, agendarColetaGenerica}){

    const tamanho = 25
    const [status, setStatus] = useState("verificando")


    const verificarStatus = async (cns) => {

    }


    useEffect(() => {
        let ativo = true;

        const timeout = setTimeout(() => {
            if (ativo) {
                setStatus("warn");
            }
        }, 15000);

        async function init() {
            try {
                const response = await agendarColetaGenerica(cns);


                if (!ativo) return;

                if (response.mensagem.Sucesso === true) {
                    setStatus("ok");
                } else {
                    setStatus("nao");
                }

            } catch (error) {
                console.error("Erro ao agendar:", error);

                if (ativo) {
                    setStatus("nao");
                }
            } finally {
                clearTimeout(timeout);
            }
        }

        init();

        return () => {
            ativo = false;
            clearTimeout(timeout);
        };

    }, []);


    return(
        <div className="itemEsperandoColeta" style={{}}>

            <div style={{backgroundColor:"lightgreen", width:5, height:"100%", borderRadius:5, borderTopRightRadius:0, borderBottomRightRadius:0, borderTopLeftRadius:5}}>
                
            </div>

            <div style={{display:"flex", flexdirection:"column", width:"100%", paddingLeft:10, backgroundColor:"transparent", alignItems:"center"}}>
                

                {/* status */}
                <div style={{display:"flex", height:tamanho, width:tamanho, justifyContent:"center", alignItems:"center", borderRadius:5, backgroundColor:""}}>
                    {
                        status === "verificando" ? <Spinner width={tamanho} height={tamanho}/> :
                            status === "ok" ? <CircleCheck size={tamanho} color="green"/> :
                                status === "nao" ? <CircleX size={tamanho} color="red"/> :
                                    <TriangleAlert size={tamanho} color="orange"/>
                    }
                </div>
                
                <p style={{display:"inline-block", paddingLeft:10}}>{nome ? nome : "Nao informado"}</p>
                
                
                <p style={{display:"inline-block", paddingLeft:10}}>{cns ? cns : "Nao informado"}</p>
            </div>

        </div>

    )
}