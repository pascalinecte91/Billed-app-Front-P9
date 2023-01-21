
/**
 * @jest-environment jsdom
 */

import {screen, fireEvent, waitFor, within} from "@testing-library/dom"
import "@testing-library/jest-dom";
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import userEvent from "@testing-library/user-event"
import mockStore from "../__mocks__/store"
import router from "../app/Router.js"
import Bills from "../containers/Bills.js"


//* unit test as an employee


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {

    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      })
    )
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)

      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon).toBeTruthy();
    })
  //** TU bug report 1 ordre décroissant DATE */
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  

  describe("Given I am connected as employee on the Bill and i click on the icon eye", () => {
    test("It should open the modal", () => {
      const html = BillsUI({
        data: bills,
      })
      document.body.innerHTML = html;
      //Init bills
      const store = null;
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({pathname});
      }
      const billsList = new Bills({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      })
      //** fireEvent ( simulate evenement ) */
      $.fn.modal = jest.fn();
      const icon = screen.getAllByTestId("icon-eye")[0];
      const handleClickIconEye = jest.fn(() => billsList.handleClickIconEye(icon))
      icon.addEventListener("click", handleClickIconEye)
      //**  on déclenche la création de l'evenement generique */
      fireEvent.click(icon)
      expect(handleClickIconEye).toHaveBeenCalled()
      const modale = document.getElementById("modaleFile")
      expect(modale).toBeTruthy()
    })
  })

  describe("When i click on the button 'Nouvelle note de frais'", () => {
    test("then it should open the 'Envoyer une note de frais' page", () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.append(root);
    router();
    window.onNavigate(ROUTES_PATH.Bills);

    const store = null;
    const billsList = new Bills({ document, onNavigate, store, localStorage: window.localStorage,
    })

    const newBill = jest.fn(() => billsList.handleClickNewBill);
    const navButton = screen.getByTestId("btn-new-bill");
    navButton.addEventListener("click", newBill);
    userEvent.click(navButton);
    expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
    })
  })

describe("When I went on Bills page and it is loading", () => {
  test("Then, Loading page should be rendered", () => {
    document.body.innerHTML = BillsUI({ loading: true });
    expect(screen.getByText("Loading...")).toBeVisible();
    document.body.innerHTML = "";
  })
})

describe("When I am on Bills page but back-end send an error message", () => {
  test("Then, Error page should be rendered", () => {
    document.body.innerHTML = BillsUI({ error: "error message" });
    expect(screen.getByText("Erreur")).toBeVisible();

  })
})
})
})


 //*TEST NTEGRATION GET
//* todo 5

  describe("Given I am a user connected as an Employee", () => {
    describe("When I navigate to Bills", () => {
      test("fetches bills from mock API GET", async () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.append(root);
  
        const pathname = ROUTES_PATH["Bills"];
        root.innerHTML = ROUTES({ pathname: pathname, loading: true });
  
        const billsList = new Bills({ document, onNavigate, store: mockStore, localStorage: window.localStorage,
        })
        billsList.getBills().then((data) => {
          root.innerHTML = BillsUI({ data })
          expect(document.querySelector("tbody").rows.length).toBeGreaterThan(0);
          expect(screen.getByTestId("btn-new-bill")).toBeTruthy();
          expect(screen.getByText("Mes notes de frais")).toBeTruthy();
        })
      })
    
      describe("When an error occurs on API", () => {
        beforeEach(() => {
          jest.spyOn(mockStore, "bills")
          Object.defineProperty(
              window,
              'localStorage',
              { value: localStorageMock }
          )
          window.localStorage.setItem('user', JSON.stringify({
            type: 'Employee',
            email: "a@a"
          }))
          const root = document.createElement("div")
          root.setAttribute("id", "root")
          document.body.appendChild(root)
          router()
        })

        test("fetches bills from an API and fails with 404 message error", async () => {
          const html = BillsUI({ error: "Erreur 404" });
          document.body.innerHTML = html;
          const message = await screen.getByText(/Erreur 404/);
          expect(message).toBeTruthy();
        })
    
        test("fetches messages from an API and fails with 500 message error", async () => {
          const html = BillsUI({ error: "Erreur 500" });
          document.body.innerHTML = html;
          const message = await screen.getByText(/Erreur 500/);
          expect(message).toBeTruthy();
        })
      })
})
})


