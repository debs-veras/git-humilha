import moment from 'moment';
import Decimal from 'decimal.js';

export const converterDecimal = (
  valor: string | number,
  decimalPlaces: number = 2
) => {
  return new Decimal(valor)
    .toDecimalPlaces(decimalPlaces, Decimal.ROUND_UP)
    .toString();
};

export const formatPhone = (telefone: string): string => {
  if (!telefone) return '';
  let r = telefone.replace(/\D/g, '');
  r = r.replace(/^0/, '');
  if (r.length > 10) r = r.replace(/^(\d\d)(\d{5})(\d{4}).*/, '($1) $2-$3');
  else if (r.length > 5)
    r = r.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, '($1) $2-$3');
  else if (r.length > 2) r = r.replace(/^(\d\d)(\d{0,5})/, '($1) $2');
  else r = r.replace(/^(\d*)/, '($1');
  return r;
};

export const formatCpf = (cpf: string, mensagemInvalido?: boolean): string => {
  if (!cpf) return 'Não informado';
  if (cpf.length != 11 && mensagemInvalido) return `${cpf} (CPF Inválido)`;
  let r = cpf.replace(/\D/g, '');
  r = r.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4');
  return r;
};

export const removeMask = (item: string): string => {
  return item.replace(/\D/g, '');
};

export const formatDateTime = (
  data: Date | string,
  tipo: '' | 'data' | 'hora' = '',
  segundos: boolean = false
): string => {
  if (tipo == 'data') return moment(data).format('DD/MM/YYYY');
  if (tipo == 'hora')
    return segundos
      ? moment(data).format('HH:mm:ss')
      : moment(data).format('HH:mm');
  return segundos
    ? moment(data).format('DD/MM/YYYY HH:mm:ss')
    : moment(data).format('DD/MM/YYYY HH:mm');
};

export const formatDateName = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

export const formatDecimal = (
  valor: string | number,
  decimalPlaces: number = 2
): string => {
  if (valor === 0) return '0';
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimalPlaces,
  }).format(Number(converterDecimal(valor, decimalPlaces)));
};
