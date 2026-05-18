import os

routes = [
  ('agenda', 'Agenda', 'agendas', 'getAgendas'),
  ('gotong-royong', 'GotongRoyong', 'gotongRoyong', 'getGotongRoyong'),
  ('iuran', 'Iuran', 'iuran', 'getIuran'),
  ('laporan', 'Laporan', 'laporan', 'getLaporan'),
  ('pengumuman', 'Pengumuman', 'pengumuman', 'getPengumuman'),
  ('kontak', 'Kontak', 'kontak', 'getKontakDarurat')
]

for route, ComponentPrefix, propName, fetchFunc in routes:
    old_page = f'src/app/{route}/page.tsx'
    new_client = f'src/app/{route}/{ComponentPrefix}Client.tsx'
    
    if os.path.exists(old_page):
        os.rename(old_page, new_client)
        
        with open(new_client, 'r', encoding='utf-8') as f:
            content = f.read()
            
        content = content.replace(f'export default function {ComponentPrefix}Page()', f'export default function {ComponentPrefix}Client({{ {propName} }}: {{ {propName}: any[] }})')
        
        # We just remove any line containing mock-data import
        lines = content.split('\n')
        lines = [l for l in lines if 'mock-data' not in l]
        content = '\n'.join(lines)
        
        # Replace mock variable usage
        mock_var = f'mock{ComponentPrefix if route != "agenda" and route != "kontak" else ("Agendas" if route == "agenda" else "KontakDarurat")}'
        if route == 'iuran': mock_var = 'mockIuran'
        
        content = content.replace(mock_var, propName)
        
        with open(new_client, 'w', encoding='utf-8') as f:
            f.write(content)
            
        file_map = {
            'agenda': 'agenda',
            'gotong-royong': 'gotongRoyong',
            'iuran': 'iuran',
            'laporan': 'laporan',
            'pengumuman': 'announcements',
            'kontak': 'kontak'
        }
        
        page_content = f'''import React from "react";
import {ComponentPrefix}Client from "./{ComponentPrefix}Client";
import {{ {fetchFunc} }} from "@/lib/data/{file_map[route]}";

export default async function {ComponentPrefix}Page() {{
  const data = await {fetchFunc}();
  return <{ComponentPrefix}Client {propName}={{data}} />;
}}
'''
        with open(old_page, 'w', encoding='utf-8') as f:
            f.write(page_content)
