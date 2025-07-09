# Start the Flask backend server
$BackendPath = Join-Path -Path (Get-Location).Path -ChildPath "..\healthview-echogame-nextjs\backend"
Start-Process -FilePath "python" -ArgumentList "API_server.py" -WorkingDirectory $BackendPath -NoNewWindow

# Start the frontend development server
npm run dev
