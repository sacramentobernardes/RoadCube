-- Método Intermediário entre o Básico e o CFOP. As posições são reescritas em
-- duas etapas porque cada posição é única: primeiro tudo vai para longe, depois
-- cada lição recebe a posição nova. Este bloco é a ordem completa da trilha.

update public.lessons set position = position + 1000;

insert into public.lessons (id, position) values
  ('m1-anatomy', 1), ('m1-faces', 2), ('m1-prime', 3),
  ('m1-wide', 4), ('m1-rotations', 5), ('m2-cross', 6),
  ('m2-corners', 7), ('m2-middle', 8), ('m2-yellow-cross', 9),
  ('m2-yellow-face', 10), ('m2-corners-perm', 11), ('m2-edges-perm', 12),
  ('m7-corners', 13), ('m7-middle', 14), ('m7-yellow-cross', 15),
  ('m7-yellow-face', 16), ('m7-corners-perm', 17), ('m7-edges-perm', 18),
  ('m3-cross', 19), ('m3-pairs', 20), ('m3-f2l-basic', 21),
  ('m3-f2l-adv', 22), ('m4-eo', 23), ('m4-ocll-1', 24),
  ('m4-ocll-2', 25), ('m5-cp', 26), ('m5-ep', 27),
  ('m5-full-1', 28), ('m5-full-2', 29), ('m5-full-3', 30),
  ('m6-f2l-up', 31), ('m6-f2l-top-1', 32), ('m6-f2l-top-2', 33),
  ('m6-f2l-edge-slot', 34), ('m6-f2l-corner-slot', 35), ('m6-f2l-both-slot', 36),
  ('m6-oll-dot-1', 37), ('m6-oll-dot-2', 38), ('m6-oll-square', 39),
  ('m6-oll-fish', 40), ('m6-oll-knight', 41), ('m6-oll-line', 42),
  ('m6-oll-p', 43), ('m6-oll-ctw', 44), ('m6-oll-l', 45),
  ('m6-oll-awkward', 46)
on conflict (id) do update set position = excluded.position;
