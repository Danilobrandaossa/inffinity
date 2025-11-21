import { initMercadoPago, type MercadoPagoInstance } from '@mercadopago/sdk-js';

let mercadoPagoInstance: MercadoPagoInstance | null = null;

export function getMercadoPago() {
  if (mercadoPagoInstance) return mercadoPagoInstance;

  const publicKey = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY;

  if (!publicKey) {
    throw new Error(
      'VITE_MERCADO_PAGO_PUBLIC_KEY não configurada. Defina esta variável no arquivo .env do frontend.',
    );
  }

  mercadoPagoInstance = initMercadoPago(publicKey, {
    locale: 'pt-BR',
  });

  return mercadoPagoInstance;
}



