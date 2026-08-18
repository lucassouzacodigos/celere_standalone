import { useNavigate } from "react-router-dom"
import HomeButton from "../components/HomeButton"
import { addRegister, getAllRegisters } from "../../services/dbcursor"
import { useEffect, useState } from "react"




export default function Analytics () {

    const navigate = useNavigate()
    const [userData, setUserData] = useState({})
    const [registers, setRegisters] = useState([])



//TESTE
    // const handleAgendamento = async () => {
    //     console.log("adicionando registro")
    //     console.log(userData.nome)
    //     console.log(userData.unidade)
    //     if(!userData) return console.log("erro ao registrar log de agendamento")
    //     await addRegister(userData?.unidade, userData?.nome)
    // }  


    useEffect(() => {
        async function getDadosFormatados(){
            const dados = await window.electron.getDadosFormatados()
            console.log(dados)
            setUserData(dados)

        }

        async function baixarLogs(){
            const dados = await getAllRegisters()
            setRegisters(dados)
            console.log(dados)
        }
        getDadosFormatados()
        baixarLogs()
        
    }, [])


    return(

        <div className="container">
            <HomeButton/>



{/* apenas agradeça GPT pelo .sort  */}
            <div style={{display: "flex", flexDirection: "column", overflowY: "auto"}}>
                {registers.length > 0 && registers
                    .filter((item) => item.tipoAcao == "Agendamento" && item.hora)
                    .sort((a, b) => {
                    const [diaA, mesA, anoA] = a.data.split("/");
                    const [horaA, minutoA] = a.hora.split(":");

                    const [diaB, mesB, anoB] = b.data.split("/");
                    const [horaB, minutoB] = b.hora.split(":");

                    const dataA = new Date(
                        anoA,
                        mesA - 1,
                        diaA,
                        horaA,
                        minutoA
                    );

                    const dataB = new Date(
                        anoB,
                        mesB - 1,
                        diaB,
                        horaB,
                        minutoB
                    );

                    return dataB - dataA;
                })
                    .map((item, index) => (
                    <div key={index} style={{marginBottom: "10px", backgroundColor: "grey", padding: 10, borderRadius: 10}}>
                        <p>Quem fez: {item.quemAgendou}</p>
                        <p>Agendado para: {item.agendadoPara}</p>
                        <p>Unidade: {item.unidade}</p>
                        <p>Data: {item.data ?? ''}</p>
                        <p>Hora: {item.hora ?? ''}</p>
                        <p>Tipo de ação: {item.tipoAcao ?? ''}</p>
                    </div>
                ))}


            </div>

        </div>



    )
}