document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-assistencia");
  const cpfInput = document.getElementById("cpf");
  const telefoneInput = document.getElementById("telefone");
  const btnSubmit = document.getElementById("btn-submit");

  const numeroWhatsapp = "5514997317570";
  const googleScriptUrl = "https://script.google.com/macros/s/AKfycbxUGFedIBMrweQMLQhZ2DtfzBJNgNle01pGoH-wMjVGc32OdI9tofUVX66wSQivIKKJPA/exec";

  /* ==========================================================================
     MÁSCARAS DE ENTRADA (CPF E TELEFONE)
     ========================================================================== */
  cpfInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    e.target.value = value;
  });

  telefoneInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
    value = value.replace(/(\d{5})(\d)/, "$1-$2");
    e.target.value = value;
  });

  /* ==========================================================================
     ENVIO INTEGRADO
     ========================================================================== */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    btnSubmit.disabled = true;
    btnSubmit.innerText = "Enviando dados...";

    const nome = document.getElementById("nome").value.trim();
    const cpf = cpfInput.value.trim();
    const telefone = telefoneInput.value.trim();
    const descricao = document.getElementById("descricao").value.trim();
    const fotoInput = document.getElementById("foto");

    let payload = {
      nome: nome,
      cpf: cpf,
      telefone: telefone,
      descricao: descricao,
      fotoBase64: null,
      fotoNome: null,
      fotoMimeType: null
    };

    if (fotoInput.files.length > 0) {
      const file = fotoInput.files[0];
      payload.fotoNome = file.name;
      payload.fotoMimeType = file.type;
      payload.fotoBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    }

    // Envio assíncrono para o Apps Script
    try {
      await fetch(googleScriptUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error("Erro ao enviar dados para a planilha:", err);
    }

    /* MENSAGEM LIMPA DO WHATSAPP */
    let mensagem = `Olá, gostaria de solicitar uma assistência técnica.\n\nNome: ${nome}\nProblema: ${descricao}`;

    const mensagemEncoded = encodeURIComponent(mensagem);
    const urlWhatsapp = `https://wa.me/${numeroWhatsapp}?text=${mensagemEncoded}`;

    btnSubmit.disabled = false;
    btnSubmit.innerText = "Enviar solicitação";

    window.open(urlWhatsapp, "_blank");
  });
});