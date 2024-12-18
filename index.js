const { readFileSync } = require('fs');

  // função extraída
function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR",
    { style: "currency", currency: "BRL",
      minimumFractionDigits: 2 }).format(valor/100);
}

function getPeca(apresentacao) {
  return pecas[apresentacao.id];
}

function gerarFaturaStr (fatura, calc) {  
  let faturaStr = `Fatura ${fatura.cliente}\n`;
  for (let apre of fatura.apresentacoes) {
    faturaStr += `  ${calc.repo.getPeca(apre).nome}: ${formatarMoeda(calc.calcularTotalApresentacao(apre))} (${apre.audiencia} assentos)\n`;
  }
  faturaStr += `Valor total: ${formatarMoeda(calc.calcularTotalFatura(fatura))}\n`;
  faturaStr += `Créditos acumulados: ${calc.calcularTotalCreditos(fatura)} \n`;
  return faturaStr;
}

function gerarFaturaHTML (fatura, pecas,calc) {  

  let faturaStr = '<html>\n';
  faturaStr+=`<p> Fatura ${fatura.cliente} </p>\n`;
  faturaStr += '<ul>\n';
  for (let apre of fatura.apresentacoes) {
    faturaStr += `<li> ${getPeca(apre).nome}: ${formatarMoeda(calc.calcularTotalApresentacao(apre))} (${apre.audiencia} assentos) </li>\n`;
  }
  faturaStr += '</ul>\n';
  faturaStr += `<p> Valor total: ${formatarMoeda(calc.calcularTotalFatura(pecas,fatura))} </p>\n`;
  faturaStr += `<p> Créditos acumulados: ${calc.calcularTotalCreditos(pecas,fatura)} </p>\n`;
  faturaStr += '</html>\n';
  return faturaStr;
}

class Repositorio {
  constructor() {
    this.pecas = JSON.parse(readFileSync('./pecas.json'));
  }

  getPeca(apre) {
    return this.pecas[apre.id];
  }
}

class ServicoCalculoFatura{

  constructor(repo) {
    this.repo = repo;
  }

  // função extraída
   calcularTotalApresentacao(apre) {
    let total = 0;
    switch (this.repo.getPeca(apre).tipo) {
      case "tragedia":
        total = 40000;
        if (apre.audiencia > 30) {
          total += 1000 * (apre.audiencia - 30);
        }
        break;
      case "comedia":
        total = 30000;
        if (apre.audiencia > 20) {
          total += 10000 + 500 * (apre.audiencia - 20);
        }
        total += 300 * apre.audiencia;
        break;
      default:
          throw new Error(`Peça desconhecia: ${this.repo.getPeca(apre).tipo}`);
      }
      return total;
  }
  
   calcularCredito(apre) {
    let creditos = 0;
    creditos += Math.max(apre.audiencia - 30, 0);
    if (this.repo.getPeca(apre).tipo === "comedia") 
      creditos += Math.floor(apre.audiencia / 5);
    return creditos;   
  }
  
  
   calcularTotalFatura(apresentacoes){
    let totalFatura = 0;
    for (let apre of apresentacoes.apresentacoes) {
      totalFatura += this.calcularTotalApresentacao(apre);
    }
    return totalFatura;
  }
  
   calcularTotalCreditos(apre){
    let creditos = 0;
    for (let apres of apre.apresentacoes) {
      creditos+=this.calcularCredito(apres)
    }
    return creditos;
  }
  
}



const faturas = JSON.parse(readFileSync('./faturas.json'));
const calc = new ServicoCalculoFatura(new Repositorio());
const faturaStr = gerarFaturaStr(faturas, calc);
console.log(faturaStr);