require 'json'
require 'fileutils'
require 'open3'
require 'pathname'

module ProjectPages
  class RenderedPage < Jekyll::StaticFile
    def initialize(site, relative, manifest, html)
      super(site, site.source, relative, 'index.html')
      @path = manifest
      @html = html
    end

    def write(dest)
      target = destination(dest)
      FileUtils.mkdir_p(File.dirname(target))
      File.binwrite(target, @html)
      true
    end
  end

  class Generator < Jekyll::Generator
    safe true
    priority :high

    def generate(site)
      template = Pathname.new(__dir__)
      source_files = %w[build.py jekyll.rb page.html README.md].map { |name| (template / name).to_s }
      cards = []
      rendered = []

      Dir.glob(site.in_source_dir('projects/*/page.json')).sort.each do |manifest|
        project = Pathname.new(manifest).dirname
        relative = project.relative_path_from(Pathname.new(site.source)).to_s
        config = JSON.parse(File.read(manifest))
        if (project / 'index.html').exist?
          raise Jekyll::Errors::FatalException, "Remove generated source file: #{relative}/index.html"
        end

        html, error, status = Open3.capture3('python3', (template / 'build.py').to_s, project.to_s)
        unless status.success?
          raise Jekyll::Errors::FatalException, "Project #{relative}: #{error.strip}"
        end

        url = "/#{relative}/"
        rendered << RenderedPage.new(site, relative, manifest, html)

        card = config.fetch('card', {})
        image = card['image']
        image = "#{url}#{image}" if image && !image.start_with?('/') && !image.match?(%r{\Ahttps?://})
        cards << { 'title' => config.fetch('name'), 'description' => card.fetch('description', config['description']),
                   'img' => image, 'url' => url, 'importance' => card.fetch('order', 0) }

        source_files.concat(%w[page.json theme.json content.html README.md].map { |name| (project / name).to_s })
        source_files << (project / config['citation']).to_s if config['citation']
      end

      site.data['projects'] = cards
      starter = (template / 'starter').to_s + '/'
      source_files.map! { |path| File.expand_path(path) }
      site.static_files.reject! { |file| source_files.include?(File.expand_path(file.path)) || file.path.start_with?(starter) }
      site.static_files.concat(rendered)
    end
  end
end
