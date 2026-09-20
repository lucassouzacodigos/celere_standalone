

import {addDoc, collection, getDocs, getDoc, doc, limit, orderBy, query, } from "firebase/firestore";
import db from "./firebase"


async function addRegister(unidade, quemAgendou, agendadoPara, tipoAcao, pacienteAgendado) {
    const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const data = new Date().toLocaleDateString('pt-BR');

    const docRef = await addDoc(collection(db, "agendamentos"), {
        unidade: unidade || '',
        quemAgendou: quemAgendou || '',
        agendadoPara: agendadoPara || '',
        pacienteAgendado: pacienteAgendado || '',
        tipoAcao: tipoAcao || '',
        data: data || '',
        hora: hora || '',
        createdAt: new Date().getTime()
    })

    console.log("Document written with ID: ", docRef.id);
} 

async function getAllRegisters() {
    const querySnapshot = await getDocs(query(
        collection(db, "agendamentos"),
        orderBy("createdAt", "desc"),
        limit(100)
    ));
    const agendamentos = [];
    querySnapshot.forEach((doc) => {
        agendamentos.push(doc.data());
    });
    return agendamentos;
}


async function testForKillSwitch(){
    const querySnapshot = await getDoc(doc(db, "KillSwitch", "KillSwitch"));
    return querySnapshot.data()
}


export { addRegister, getAllRegisters, testForKillSwitch }