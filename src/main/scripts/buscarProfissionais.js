
import { session } from "electron"

export async function buscarProfissional(dados) {
    const ses = session.fromPartition("persist:saude-session");

    const response = await ses.fetch(
    "https://sistema.saudepublica.digital/celere.embudasartes/CompartilhadoProfissional/GridResultadoPesquisa",
        {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest"
            },
            body: JSON.stringify(dados)
        }
    );

  return response.text();
}