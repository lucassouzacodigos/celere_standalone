

import {addDoc, collection, getDocs, getDoc, getCountFromServer, doc, limit, orderBy, query, } from "firebase/firestore";
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
    const registersQuery = query(
        collection(db, "agendamentos"),
        orderBy("createdAt", "desc"),
        limit(750)
    );
    const [querySnapshot, countSnapshot] = await Promise.all([
        getDocs(registersQuery),
        getCountFromServer(collection(db, "agendamentos"))
    ]);
    const agendamentos = [];
    querySnapshot.forEach((doc) => {
        agendamentos.push(doc.data());
    });
    return {
        registers: agendamentos,
        totalCount: countSnapshot.data().count
    };
}


async function testForKillSwitch(){
    const querySnapshot = await getDoc(doc(db, "KillSwitch", "KillSwitch"));
    const data = querySnapshot.data();
    return {
        KillSwitch: data?.KillSwitch,
        message: data?.message
    };
}


export { addRegister, getAllRegisters, testForKillSwitch }