name="Velvet Thunder"
email="velvet.thunder49@proton.me"

echo "a" >> changes
git config --global user.name "$name"
git config --global user.email "$email"
git add changes
git commit -m "feat: changes"
rm changes
git add changes
git commit -m "feat: remove changes"
git push origin main