1. Work on the source branch. Commit your desired changes.
2. rake publish
3. cd build/
4. git checkout gh-pages
5. git pull origin gh-pages
6. git checkout master
7. git merge gh-pages
8. git push origin master
