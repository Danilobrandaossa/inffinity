import { useEffect, useId, useRef } from 'react';
import { getMercadoPago } from '@/lib/mercadoPago';

interface CardPaymentBrickProps {
  amount: number;
  payerEmail: string;
  onSubmit: (cardFormData: any) => Promise<void>;
  onReady?: () => void;
  onError?: (error: unknown) => void;
  dependencies?: unknown[];
}

export default function CardPaymentBrick({
  amount,
  payerEmail,
  onSubmit,
  onReady,
  onError,
  dependencies = [],
}: CardPaymentBrickProps) {
  const containerId = useId();
  const brickControllerRef = useRef<any>(null);

  useEffect(() => {
    if (!amount || !payerEmail) return;

    let cancelled = false;

    async function renderBrick() {
      try {
        const mp = getMercadoPago();
        const bricksBuilder = mp.bricks();

        if (brickControllerRef.current) {
          brickControllerRef.current.destroy();
        }

        const controller = await bricksBuilder.create('cardPayment', `card-payment-brick-${containerId}`, {
          initialization: {
            amount,
            payer: {
              email: payerEmail,
            },
          },
          customization: {
            paymentMethods: {
              maxInstallments: 1,
            },
            visual: {
              style: {
                theme: 'default',
              },
            },
          },
          callbacks: {
            onReady: () => {
              if (cancelled) return;
              onReady?.();
            },
            onError: (error: unknown) => {
              if (cancelled) return;
              console.error('Mercado Pago Brick error', error);
              onError?.(error);
            },
            onSubmit: async (cardFormData: any) => {
              await onSubmit(cardFormData);
            },
          },
        });

        if (!cancelled) {
          brickControllerRef.current = controller;
        } else {
          controller.destroy();
        }
      } catch (error) {
        console.error('Erro ao inicializar CardPaymentBrick', error);
        onError?.(error);
      }
    }

    renderBrick();

    return () => {
      cancelled = true;
      brickControllerRef.current?.destroy();
      brickControllerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, payerEmail, containerId, ...dependencies]);

  return <div id={`card-payment-brick-${containerId}`} />;
}



