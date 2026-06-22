-- 이미 가입되어 있던 사용자들의 프로필 정보를 일괄 생성해주는 스크립트입니다.
INSERT INTO public.profiles (id, email)
SELECT id, email FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);
