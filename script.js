const traducoesClima = {
    "clear sky": "Céu limpo",
    "few clouds": "Poucas nuvens",
    "scattered clouds": "Nuvens dispersas",
    "broken clouds": "Nuvens fragmentadas",
    "light rain": "Chuva leve",
    "rain": "Chuva",
    "thunderstorm": "Tempestade",
    "snow": "Neve",
    "mist": "Neblina",
    "overcast clouds": "Nuvens cobertas",
    "moderate rain": "Chuva moderada",
    "heavy intensity rain": "Chuva de forte intensidade",
    "light snow": "Neve leve"
};

const diasDaSemana = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];

document.getElementById('obterClima').addEventListener('click', () => {
    const localizacao = document.getElementById('localizacao').value;
    if (localizacao) {
        obterClima(localizacao);
    } else {
        alert('Por favor, digite uma localização.');
    }
});

document.getElementById('minhaLocalizacao').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const cidade = await obterNomeCidade(latitude, longitude);
            document.getElementById('localizacao').value = cidade;
            obterClimaPorCoordenadas(latitude, longitude);
        }, () => {
            alert('Não foi possível obter sua localização.');
        });
    } else {
        alert('Geolocalização não é suportada por este navegador.');
    }
});

async function obterNomeCidade(lat, lon) {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
    const data = await response.json();
    return data.address.city || data.address.town || data.address.village || 'Localização desconhecida';
}

async function obterClima(localizacao) {
    try {
        const apiKey = '8dd9a5805ebb213a3158fa23edd028cd';
        
        if (!localizacao.includes(',')) {
            localizacao += ', Brasil';
        }
        
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(localizacao)}&cnt=40&units=metric&appid=${apiKey}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Local não encontrado ou erro na API.');
        }
        
        const data = await response.json();
        exibirDias(data);
    } catch (error) {
        document.getElementById('previsaoDia').innerHTML = `<p>${error.message}</p>`;
    }
}

async function obterClimaPorCoordenadas(lat, lon) {
    try {
        const apiKey = '8dd9a5805ebb213a3158fa23edd028cd';
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&cnt=40&units=metric&appid=${apiKey}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Erro ao obter a localização.');
        }

        const data = await response.json();
        exibirDias(data);
    } catch (error) {
        document.getElementById('previsaoDia').innerHTML = `<p>${error.message}</p>`;
    }
}

function exibirDias(data) {
    const diasDaSemanaContainer = document.getElementById('diasDaSemana');
    diasDaSemanaContainer.innerHTML = '';

    const previsao = data.list;
    const previsoesFuturas = {};

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const hojeString = hoje.toISOString().split('T')[0];

    previsao.forEach(item => {
        const dataFormatada = new Date(item.dt * 1000);
        const dataString = dataFormatada.toISOString().split('T')[0];

        if (!previsoesFuturas[dataString]) {
            previsoesFuturas[dataString] = { dia: diasDaSemana[dataFormatada.getUTCDay()], itens: [] };
        }

        previsoesFuturas[dataString].itens.push({
            temp: item.main.temp,
            descricao: traducoesClima[item.weather[0].description] || item.weather[0].description,
            hora: dataFormatada.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
    });

    for (const [dataString, previsao] of Object.entries(previsoesFuturas)) {
        const cor = obterCorDia(previsao.dia);
        const div = document.createElement('div');
        div.classList.add('col', 'bloquinho');
        div.style.backgroundColor = cor;

        const icone = dataString === hojeString ? '<i class="fas fa-sun"></i>' : '';
        div.innerHTML = `<h4>${previsao.dia} ${icone}</h4>`;
        div.addEventListener('click', () => exibirPrevisaoDia(previsao.itens, previsao.dia));
        diasDaSemanaContainer.appendChild(div);
    }
}

function obterCorDia(dia) {
    const cores = {
        "domingo": "#FF6347",
        "segunda-feira": "#4682B4",
        "terça-feira": "#32CD32",
        "quarta-feira": "#FFD700",
        "quinta-feira": "#FF69B4",
        "sexta-feira": "#8A2BE2",
        "sábado": "#FF4500"
    };
    return cores[dia];
}

function obterCorAba(dia) {
    const cores = {
        "domingo": "#FF7F50",
        "segunda-feira": "#87CEFA",
        "terça-feira": "#98FB98",
        "quarta-feira": "#FFFACD",
        "quinta-feira": "#FFB6C1",
        "sexta-feira": "#DA70D6",
        "sábado": "#FFA07A"
    };
    return cores[dia];
}

function exibirPrevisaoDia(itens, dia) {
    const previsaoDia = document.getElementById('previsaoDia');
    previsaoDia.innerHTML = `<h3>Previsão para ${dia}</h3>`;
    previsaoDia.style.backgroundColor = obterCorAba(dia);

    if (itens.length === 0) {
        previsaoDia.innerHTML += `<p>Nenhuma previsão disponível.</p>`;
    } else {
        itens.forEach(item => {
            previsaoDia.innerHTML += `
                <div class="weather-item">
                    <p>Temp: ${item.temp}°C</p>
                    <p>${item.descricao} às ${item.hora}</p>
                    <div class="recomendacao-roupas">${obterRecomendacoesRoupas(item.temp)}</div>
                </div>
            `;
        });
    }
}

function obterRecomendacoesRoupas(temp) {
    let recomendacoes = '';
    if (temp < 0) {
        recomendacoes = 'Sugestão: Vista-se com várias camadas, incluindo um casaco pesado, gorro, cachecol e luvas para se proteger do frio intenso.';
    } else if (temp >= 0 && temp < 10) {
        recomendacoes = 'Sugestão: Utilize um abrigo ou um suéter quente. Lembre-se de incluir acessórios como luvas e um chapéu para o frio.';
    } else if (temp >= 10 && temp < 15) {
        recomendacoes = 'Sugestão: Opte por uma jaqueta leve ou um pulôver. Uma camisa de manga longa pode complementar bem o visual.';
    } else if (temp >= 15 && temp < 20) {
        recomendacoes = 'Sugestão: Um suéter fino ou uma jaqueta leve são adequados. Considere usar camisetas de manga curta para conforto.';
    } else if (temp >= 20 && temp < 25) {
        recomendacoes = 'Sugestão: Prefira roupas frescas, como t-shirts e calças leves. Um boné pode ajudar a proteger do sol forte.';
    } else if (temp >= 25 && temp < 30) {
        recomendacoes = 'Sugestão: Escolha vestimentas bem leves, como tops de algodão e shorts. Não esqueça de passar protetor solar!';
    } else {
        recomendacoes = 'Sugestão: Use roupas extremamente leves, como regatas e bermudas. É importante se manter hidratado durante o dia!';
    }
    return recomendacoes;
}