import React from 'react';
import { Github, Twitter, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer id="footer" className="bg-gray-900 text-gray-300 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2">
              <h3 className="text-2xl text-white mb-3">theodore-js</h3>
              <p className="text-gray-400 mb-4">
                Theodore is a text input that replaces emoji characters with
                custom images, ensuring consistent display across all browsers
              </p>
              <div className="flex gap-4">
                <a
                  href="https://github.com/fatemehkarimi/theodore"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-violet-400 transition-colors"
                >
                  <Github className="w-5 h-5" />
                </a>
                {/* <a
                  href="https://twitter.com"
                  className="hover:text-violet-400 transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a> */}
              </div>
            </div>

            <div>
              <h4 className="text-white font-medium mb-3">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="https://github.com/fatemehkarimi/theodore/blob/master/README.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-violet-400 transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/fatemehkarimi/theodore/tree/master/playground"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-violet-400 transition-colors"
                  >
                    Examples
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/fatemehkarimi/theodore/releases"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-violet-400 transition-colors"
                  >
                    Changelog
                  </a>
                </li>
                {/* <li>
                  <a
                    href="#"
                    className="hover:text-violet-400 transition-colors"
                  >
                    Contributing
                  </a>
                </li> */}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-medium mb-3">Community</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="https://github.com/fatemehkarimi/theodore/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-violet-400 transition-colors"
                  >
                    GitHub Issues
                  </a>
                </li>
                {/* <li>
                  <a
                    href="#"
                    className="hover:text-violet-400 transition-colors"
                  >
                    Discussions
                  </a>
                </li> */}
                {/* <li>
                  <a
                    href="#"
                    className="hover:text-violet-400 transition-colors"
                  >
                    Twitter
                  </a>
                </li> */}
                <li>
                  <a
                    href="https://www.npmjs.com/package/theodore-js"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-violet-400 transition-colors"
                  >
                    NPM Package
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} theodore-js. MIT License.
            </p>
            <p className="text-gray-400 text-sm flex items-center gap-2">
              Made with <Heart className="w-4 h-4 text-red-500 fill-current" />{' '}
              by fatemeh karimi, for classy web apps{' '}
              <img
                src="/1f485-1f3fb.png"
                className="w-4 h-4"
                style={{ marginBlockStart: '-8px' }}
              />
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
