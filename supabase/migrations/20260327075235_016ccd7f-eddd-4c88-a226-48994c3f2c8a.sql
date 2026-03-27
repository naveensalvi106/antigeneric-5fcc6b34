-- Create thumbnail submissions table
create table public.thumbnail_submissions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  thumbnail_image_url text,
  face_image_url text,
  status text not null default 'pending',
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.thumbnail_submissions enable row level security;

-- Allow anonymous inserts (public form)
create policy "Allow anonymous inserts"
  on public.thumbnail_submissions
  for insert
  to anon
  with check (true);

-- Create storage bucket for uploads
insert into storage.buckets (id, name, public)
values ('thumbnail-uploads', 'thumbnail-uploads', true);

-- Allow anonymous uploads to the bucket
create policy "Allow anonymous uploads"
  on storage.objects
  for insert
  to anon
  with check (bucket_id = 'thumbnail-uploads');

-- Allow public reads
create policy "Allow public reads on thumbnail-uploads"
  on storage.objects
  for select
  to anon
  using (bucket_id = 'thumbnail-uploads');