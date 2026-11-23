Feature: Demo-3 automated documentation sync and bookstore preview

  Scenario: CLI reports a custom scan and creates Markdown API documentation
    Given a temporary JavaScript project has a marked README and an API endpoint
    When I run the documentation sync CLI against that project
    Then the captured CLI output reports the scanned file and documentation updates
    And the generated Markdown documents the endpoint and preserves the README notes

  Scenario: The generated bookstore HTML preview displays the starter catalog
    Given the bookstore demo data has been reset
    When I open the bookstore homepage in a browser
    Then the HTML preview displays the bookstore title and three starter books

  Scenario: A reader adds a book and finds it with catalog search
    Given the bookstore demo data has been reset
    When I add a book with a title, author, and category
    And I search for the new book title
    Then the catalog shows only the matching book

  Scenario: Reset restores the demo catalog after a book is added
    Given the bookstore demo data has been reset
    When I add a temporary book and run resetDemo.js
    Then the starter catalog is restored in the browser and on disk
