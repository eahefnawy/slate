Yellow API Docs
================
Yellow API Docs are powered by [Slate](https://github.com/tripit/slate)

# Getting Set Up

 1. Make sure Ruby v1.9.3 and bundler are installed. Install bundler with `gem install bundler`
 2. Clone this repo with `git clone https://github.com/eahefnawy/slate.git`
 3. `cd slate`
 4. Install all dependencies: `bundle install`
 5. Start the test server: `bundle exec middleman server`
 6. Make your edits in `/source/index.md`. As easy as that!


# Publishing Your Docs to Github Pages

Publishing your API documentation couldn't be more simple.

 1. Commit your changes to the markdown source: `git commit -a -m "Update index.md"`
 2. Push the *markdown source* changes to Github: `git push`
 3. Add "gh-pages" as a local branch pointing to the remote ([GitHub doc](https://help.github.com/articles/creating-project-pages-manually))
 4. Compile to HTML, and push the HTML to Github pages: `rake publish`

Done! Your changes should now be live on http://yourusername.github.io/slate, and the main branch should be updated with your edited markdown. Note that if this is your first time publishing Slate, it can sometimes take ten minutes or so before your content is available online.

# Publishing Your Docs to Your Own Server

Instead of using `rake publish`, use `rake build`. Middleman will build your website to the `build` directory of your project, and you can copy those static HTML files to the server of your choice.
