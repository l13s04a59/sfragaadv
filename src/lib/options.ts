import type { FieldOption } from "./form-types";

export const simNao: FieldOption[] = [
  { label: "Sim", value: "sim" },
  { label: "Não", value: "nao" },
];

export const simNaoNaoSei: FieldOption[] = [
  { label: "Sim", value: "sim" },
  { label: "Não", value: "nao" },
  { label: "Não sei", value: "nao_sei" },
];

export const provasSemCarteira: FieldOption[] = [
  { label: "Comprovantes de pagamento (pix)", value: "comprovantes_pix" },
  { label: "Fotos de uniforme no trabalho", value: "fotos_uniforme" },
  { label: "Conversas de whatsapp", value: "whatsapp" },
  { label: "Testemunha", value: "testemunha" },
  { label: "Outras", value: "outras" },
];

export const periodicidadePagamento: FieldOption[] = [
  { label: "Dia", value: "dia" },
  { label: "Semana", value: "semana" },
  { label: "Quinzena", value: "quinzena" },
  { label: "Mês", value: "mes" },
];

export const formaPagamento: FieldOption[] = [
  { label: "Pix", value: "pix" },
  { label: "Dinheiro", value: "dinheiro" },
  { label: "Depósito em conta", value: "deposito_conta" },
  { label: "Outro", value: "outro" },
];

export const situacaoTrabalho: FieldOption[] = [
  { label: "Ainda trabalho na empresa", value: "ainda_trabalha" },
  { label: "A empresa me dispensou sem justa causa", value: "dispensado_sem_justa_causa" },
  { label: "A empresa me dispensou com justa causa", value: "dispensado_com_justa_causa" },
  { label: "Pedi demissão", value: "pediu_demissao" },
];

export const diasTrabalho: FieldOption[] = [
  { label: "Segunda", value: "segunda" },
  { label: "Terça", value: "terca" },
  { label: "Quarta", value: "quarta" },
  { label: "Quinta", value: "quinta" },
  { label: "Sexta", value: "sexta" },
  { label: "Sábado", value: "sabado" },
  { label: "Domingo", value: "domingo" },
];

export const freqSemana: FieldOption[] = [
  { label: "1x", value: "1x" },
  { label: "2x", value: "2x" },
  { label: "3x", value: "3x" },
  { label: "4x", value: "4x" },
  { label: "Todos os dias", value: "todos_os_dias" },
];

export const tipoRegistroPonto: FieldOption[] = [
  { label: "Manual (anotava à mão)", value: "manual" },
  { label: "Eletrônico/biométrico (colocava o dedo na máquina)", value: "eletronico_biometrico" },
  { label: "Aplicativo de registro da empresa", value: "aplicativo" },
];

export const formaRegistroPonto: FieldOption[] = [
  { label: "Registrava horários quebrados (ex: 08:02)", value: "horarios_quebrados" },
  { label: "Registrava horários redondos (ex: 08:00)", value: "horarios_redondos" },
];

export const percentualInsalubridade: FieldOption[] = [
  { label: "10%", value: "10" },
  { label: "20%", value: "20" },
  { label: "40%", value: "40" },
  { label: "Não sei", value: "nao_sei" },
];

export const usuariosBanheiro: FieldOption[] = [
  { label: "Menos de 20", value: "menos_de_20" },
  { label: "Mais de 20", value: "mais_de_20" },
];

export const agentesNocivos: FieldOption[] = [
  { label: "Produtos químicos", value: "produtos_quimicos" },
  { label: "Ácido", value: "acido" },
  { label: "Graxa", value: "graxa" },
  { label: "Óleo", value: "oleo" },
  { label: "Inflamáveis ou explosivos", value: "inflamaveis_explosivos" },
  { label: "Não lidava com nenhum", value: "nenhum" },
];

export const valeAlimentacao: FieldOption[] = [
  { label: "Recebia os dois", value: "ambos" },
  { label: "Não recebia nenhum", value: "nenhum" },
  { label: "Recebia apenas Vale Alimentação", value: "apenas_va" },
  { label: "Recebia apenas Vale Refeição", value: "apenas_vr" },
];

export const meioTransporte: FieldOption[] = [
  { label: "A pé", value: "a_pe" },
  { label: "Bicicleta", value: "bicicleta" },
  { label: "Condução própria (carro, moto)", value: "conducao_propria" },
  { label: "Transporte público, pagava do próprio bolso", value: "transporte_publico_proprio" },
  { label: "Recebia Vale Transporte", value: "vale_transporte" },
];

export function isSim(v: unknown): boolean {
  return v === "sim" || v === true;
}

export function isNao(v: unknown): boolean {
  return v === "nao" || v === false;
}

export function asMulti(v: unknown): string[] {
  return Array.isArray(v) ? v.map(String) : [];
}
