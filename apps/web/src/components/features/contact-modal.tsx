'use client';

import { useState, Fragment } from 'react';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { useTranslations } from 'next-intl';

export default function ContactModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations('ContactModal');
  const [status, setStatus] = useState<'form' | 'success'>('form');

  const handleClose = () => onClose();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = fd.get('name')?.toString().trim();
    const email = fd.get('email')?.toString().trim();
    const msg = fd.get('msg')?.toString().trim();

    if (!name || !email || !msg) {
      alert(t('errorFill'));
      return;
    }

    await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, msg }),
    });

    setStatus('success');
  };

  return (
    <Transition show={open} as={Fragment} afterLeave={() => setStatus('form')}>
      <Dialog onClose={handleClose} className="relative z-[70]">
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 flex items-center justify-center md:p-6">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="translate-y-full md:opacity-0 md:scale-95"
            enterTo="translate-y-0 md:opacity-100 md:scale-100"
            leave="ease-in duration-150"
            leaveFrom="translate-y-0 md:opacity-100 md:scale-100"
            leaveTo="translate-y-full md:opacity-0 md:scale-95"
          >
            <DialogPanel
              className="
                w-full md:max-w-md
                fixed bottom-0 md:static
                rounded-t-2xl md:rounded-2xl
                bg-white p-6 shadow-xl
              "
            >
              {status === 'form' && (
                <DialogTitle className="text-lg font-semibold text-center mb-8">
                  {t('title')}
                </DialogTitle>
              )}

              {status === 'form' && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    name="name"
                    required
                    type="text"
                    placeholder={t('namePlaceholder')}
                    className="w-full rounded-md border px-3 py-2 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all duration-400"
                  />
                  <input
                    name="email"
                    required
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    className="w-full rounded-md border px-3 py-2 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all duration-400"
                  />
                  <textarea
                    name="msg"
                    required
                    rows={4}
                    placeholder={t('messagePlaceholder')}
                    className="w-full rounded-md border px-3 py-2 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all duration-400"
                  />

                  <div className="border-t border-gray-200 my-6" />

                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-md bg-black text-white hover:bg-gray-800"
                    >
                      {t('send')}
                    </button>
                  </div>
                </form>
              )}

              {status === 'success' && (
                <div className="flex flex-col items-center text-center space-y-6">
                  <p className="text-gray-700 font-medium pb-0">
                    {t('successTitle')}
                  </p>
                  <p className="text-gray-500 font-medium pb-2">
                    {t('successSubtitle')}
                  </p>
                  <button
                    onClick={handleClose}
                    className="inline-block px-4 py-2 rounded-md bg-black text-white hover:bg-gray-800"
                  >
                    {t('close')}
                  </button>
                </div>
              )}
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}