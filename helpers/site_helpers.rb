module SiteHelpers

  def page_title
    title = "Code Park"
    if data.page.title
      title << " | " + data.page.title
    end
    title
  end
  
  def page_description
    if data.page.description
      description = data.page.description
    else
      description = "We are a group of Houston developers joining forces to create welcoming environments for anyone to learn to code for the web. Our mission is to increase developer diversity in our community so we can grow stronger."
    end
    description
  end

end
