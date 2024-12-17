const form = document.getElementById('form');

form.addEventListener('submit', handleSubmit);
async function handleSubmit(e) {
    e.preventDefault();
    const form = new FormData(this);
    const response = await fetch(this.action, {
        method: this.method,
        body: form,
        headers: {
            'Accept': 'application/json'
        }
    });
    if (response.ok) {
        this.reset();
        alert('Hemos recibido tu informacion, Gracias por tu tiempo. un asesor se contactara contigo');
    }
}