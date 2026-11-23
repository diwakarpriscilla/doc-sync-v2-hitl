Feature: Bookstore demo

  Scenario: Homepage loads and displays the starter catalog
    Given the bookstore app is running
    When I open the homepage
    Then the page title is Bookstore
    And 3 starter books are visible

  Scenario: Catalog search filters books
    Given the bookstore app is running
    When I open the homepage
    And I search for "Atomic"
    Then 1 matching book is visible
    And the result count shows "1 book"
