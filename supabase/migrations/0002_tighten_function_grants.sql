revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.create_order(jsonb, text, text, text, text) from public, anon;
grant execute on function public.create_order(jsonb, text, text, text, text) to authenticated;
