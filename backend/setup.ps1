# Install required Python packages for the backend
pip install -r requirements.txt

# Create empty results files
echo "[]" > results.json
echo "userID,score,ai_score,total,timestamp" > results.csv

echo "Backend setup complete!"
