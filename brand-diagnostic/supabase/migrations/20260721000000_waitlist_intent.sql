-- Намерение: 'plan' — просто оставил почту, 'purchase' — нажал «Оплатить». Ключевой сигнал готовности платить.
alter table waitlist add column if not exists intent text;
