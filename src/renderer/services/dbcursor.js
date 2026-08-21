

import {addDoc, collection, getDocs, getDoc, doc, limit, query } from "firebase/firestore";
import db from "./firebase"


async function addRegister(unidade, quemAgendou, agendadoPara, tipoAcao) {
    const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const data = new Date().toLocaleDateString('pt-BR');

    const docRef = await addDoc(collection(db, "agendamentos"), {
        unidade: unidade || '',
        quemAgendou: quemAgendou || '',
        agendadoPara: agendadoPara || '',
        tipoAcao: tipoAcao || '',
        data: data || '',
        hora: hora || '',
    })
} 

async function getAllRegisters() {
    const registrosQuery = query(collection(db, "agendamentos"), limit(100));
    const querySnapshot = await getDocs(registrosQuery);
    const agendamentos = [];
    querySnapshot.forEach((doc) => {
        agendamentos.push(doc.data());
    });
    return agendamentos;
}


export { addRegister, getAllRegisters }