revoke delete on table "public"."link_clicks" from "anon";

revoke insert on table "public"."link_clicks" from "anon";

revoke references on table "public"."link_clicks" from "anon";

revoke select on table "public"."link_clicks" from "anon";

revoke trigger on table "public"."link_clicks" from "anon";

revoke truncate on table "public"."link_clicks" from "anon";

revoke update on table "public"."link_clicks" from "anon";

revoke delete on table "public"."link_clicks" from "authenticated";

revoke insert on table "public"."link_clicks" from "authenticated";

revoke references on table "public"."link_clicks" from "authenticated";

revoke select on table "public"."link_clicks" from "authenticated";

revoke trigger on table "public"."link_clicks" from "authenticated";

revoke truncate on table "public"."link_clicks" from "authenticated";

revoke update on table "public"."link_clicks" from "authenticated";

revoke delete on table "public"."link_clicks" from "service_role";

revoke insert on table "public"."link_clicks" from "service_role";

revoke references on table "public"."link_clicks" from "service_role";

revoke select on table "public"."link_clicks" from "service_role";

revoke trigger on table "public"."link_clicks" from "service_role";

revoke truncate on table "public"."link_clicks" from "service_role";

revoke update on table "public"."link_clicks" from "service_role";

revoke delete on table "public"."links" from "anon";

revoke insert on table "public"."links" from "anon";

revoke references on table "public"."links" from "anon";

revoke select on table "public"."links" from "anon";

revoke trigger on table "public"."links" from "anon";

revoke truncate on table "public"."links" from "anon";

revoke update on table "public"."links" from "anon";

revoke delete on table "public"."links" from "authenticated";

revoke insert on table "public"."links" from "authenticated";

revoke references on table "public"."links" from "authenticated";

revoke select on table "public"."links" from "authenticated";

revoke trigger on table "public"."links" from "authenticated";

revoke truncate on table "public"."links" from "authenticated";

revoke update on table "public"."links" from "authenticated";

revoke delete on table "public"."links" from "service_role";

revoke insert on table "public"."links" from "service_role";

revoke references on table "public"."links" from "service_role";

revoke select on table "public"."links" from "service_role";

revoke trigger on table "public"."links" from "service_role";

revoke truncate on table "public"."links" from "service_role";

revoke update on table "public"."links" from "service_role";

revoke delete on table "public"."profiles" from "anon";

revoke insert on table "public"."profiles" from "anon";

revoke references on table "public"."profiles" from "anon";

revoke select on table "public"."profiles" from "anon";

revoke trigger on table "public"."profiles" from "anon";

revoke truncate on table "public"."profiles" from "anon";

revoke update on table "public"."profiles" from "anon";

revoke delete on table "public"."profiles" from "authenticated";

revoke insert on table "public"."profiles" from "authenticated";

revoke references on table "public"."profiles" from "authenticated";

revoke select on table "public"."profiles" from "authenticated";

revoke trigger on table "public"."profiles" from "authenticated";

revoke truncate on table "public"."profiles" from "authenticated";

revoke update on table "public"."profiles" from "authenticated";

revoke delete on table "public"."profiles" from "service_role";

revoke insert on table "public"."profiles" from "service_role";

revoke references on table "public"."profiles" from "service_role";

revoke select on table "public"."profiles" from "service_role";

revoke trigger on table "public"."profiles" from "service_role";

revoke truncate on table "public"."profiles" from "service_role";

revoke update on table "public"."profiles" from "service_role";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.increment_click_count(link_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE public.links
  SET click_count = click_count + 1
  WHERE id = link_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN auth.is_admin(auth.uid());
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_approved()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN auth.is_approved(auth.uid());
END;
$function$
;


