'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const CONFIRMATION = 'DELETE_MY_RAWAFID_ACCOUNT';
const ARABIC_CONFIRMATION = 'حذف حسابي نهائيًا';

export async function reauthenticateForDeletion(formData: FormData) {
  const password = String(formData.get('current_password') ?? '');
  if (password.length < 8 || password.length > 128) redirect('/account/delete?error=current_password');

  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  const email = userData.user?.email;
  if (userError || !email) redirect('/login?next=%2Faccount%2Fdelete');

  const { error: reauthError } = await supabase.auth.signInWithPassword({ email, password });
  if (reauthError) redirect('/account/delete?error=current_password');

  const factors = await supabase.auth.mfa.listFactors();
  const hasVerifiedTotp = !factors.error && (factors.data.totp ?? []).some((factor) => factor.status === 'verified');
  if (hasVerifiedTotp) redirect('/mfa?next=%2Faccount%2Fdelete%3Fstep%3Dconfirm');
  redirect('/account/delete?step=confirm');
}

export async function deleteAccountPermanently(formData: FormData) {
  const typedEmail = String(formData.get('account_email') ?? '').trim().toLowerCase();
  const typedPhrase = String(formData.get('delete_phrase') ?? '').trim();
  const acknowledged = String(formData.get('acknowledged') ?? '') === 'yes';

  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  const email = userData.user?.email?.trim().toLowerCase();
  if (userError || !email) redirect('/login?next=%2Faccount%2Fdelete');

  if (!acknowledged || typedPhrase !== ARABIC_CONFIRMATION || typedEmail !== email) {
    redirect('/account/delete?step=confirm&error=confirmation');
  }

  const factors = await supabase.auth.mfa.listFactors();
  const hasVerifiedTotp = !factors.error && (factors.data.totp ?? []).some((factor) => factor.status === 'verified');
  if (hasVerifiedTotp) {
    const assurance = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (assurance.error || assurance.data.currentLevel !== 'aal2') {
      redirect('/mfa?next=%2Faccount%2Fdelete%3Fstep%3Dconfirm');
    }
  }

  const { data, error } = await supabase.functions.invoke('rawafid-delete-account', {
    body: { confirmation: CONFIRMATION, email },
  });

  if (error || data?.ok !== true) {
    const code = String(data?.code ?? 'delete_failed');
    if (code === 'reauth_required') redirect('/account/delete?error=reauth_required');
    if (code === 'mfa_required') redirect('/mfa?next=%2Faccount%2Fdelete%3Fstep%3Dconfirm');
    if (code === 'managed_account') redirect('/account/delete?step=confirm&error=managed_account');
    redirect('/account/delete?step=confirm&error=delete_failed');
  }

  await supabase.auth.signOut({ scope: 'local' });
  redirect('/account/delete?deleted=1');
}
