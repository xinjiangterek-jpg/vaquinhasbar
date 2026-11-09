const products = [
  {id:1,name:"Refrigerante lata",desc:"Lata 350 ml • bem gelado",price:5.50,category:"Bebidas",emoji:"🥤"},
  {id:2,name:"Água mineral",desc:"Garrafa 500 ml",price:3.00,category:"Bebidas",emoji:"💧"},
  {id:3,name:"Suco de caixinha",desc:"Caixinha 200 ml",price:4.00,category:"Bebidas",emoji:"🧃"},
  {id:4,name:"Salgadinho",desc:"Pacote individual",price:6.00,category:"Salgadinhos",emoji:"🍿"},
  {id:5,name:"Batata chips",desc:"Pacote individual",price:7.50,category:"Salgadinhos",emoji:"🥔"},
  {id:6,name:"Chocolate",desc:"Barra individual",price:5.00,category:"Doces",emoji:"🍫"},
  {id:7,name:"Bala sortida",desc:"Porção individual",price:2.00,category:"Doces",emoji:"🍬"},
  {id:8,name:"Amendoim",desc:"Pacote 100 g",price:6.50,category:"Petiscos",emoji:"🥜"}
];

const state = {cart:[],category:"Todos"};
const money = value => value.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const $ = selector => document.querySelector(selector);

function renderProducts(){
  const search = $("#searchInput").value.trim().toLowerCase();
  const visible = products.filter(p => (state.category==="Todos" || p.category===state.category) && p.name.toLowerCase().includes(search));
  $("#productGrid").innerHTML = visible.length ? visible.map(p=>`
    <article class="product-card">
      <div class="product-art"><small>${p.category}</small>${p.emoji}</div>
      <div class="product-info"><h3>${p.name}</h3><p>${p.desc}</p>
        <div class="product-bottom"><span class="price">${money(p.price)}</span><button class="add-button" data-add="${p.id}" aria-label="Adicionar ${p.name}">+</button></div>
      </div>
    </article>`).join("") : '<p class="empty-state">Nenhum produto encontrado. Tente outra busca.</p>';
}
function addToCart(id){
  const item = state.cart.find(p=>p.id===id);
  if(item) item.qty++; else state.cart.push({...products.find(p=>p.id===id),qty:1});
  renderCart(); showToast("Produto adicionado ao carrinho!");
}
function changeQty(id,delta){
  const item=state.cart.find(p=>p.id===id); if(!item)return;
  item.qty+=delta; if(item.qty<=0)state.cart=state.cart.filter(p=>p.id!==id);
  renderCart();
}
function total(){return state.cart.reduce((sum,p)=>sum+p.price*p.qty,0)}
function renderCart(){
  $("#cartCount").textContent=state.cart.reduce((sum,p)=>sum+p.qty,0);
  $("#cartTotal").textContent=money(total());
  $("#pixTotal").textContent=money(total());
  $("#cartItems").innerHTML=state.cart.length?state.cart.map(p=>`
    <div class="cart-row"><span class="cart-emoji">${p.emoji}</span><div class="cart-row-info"><b>${p.name}</b><small>${money(p.price)} cada</small></div>
    <div class="quantity"><button data-minus="${p.id}" aria-label="Diminuir">−</button><b>${p.qty}</b><button data-plus="${p.id}" aria-label="Aumentar">+</button></div></div>`).join(""):'<div class="empty-state">Seu carrinho está vazio.<br>Escolha alguns produtos para começar.</div>';
  $("#checkoutButton").disabled=!state.cart.length;
}
function showToast(message){const toast=$("#toast");toast.textContent=message;toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),2600)}
function openCart(){ $("#cartOverlay").classList.add("open");$("#cartOverlay").setAttribute("aria-hidden","false");}
function closeCart(){ $("#cartOverlay").classList.remove("open");$("#cartOverlay").setAttribute("aria-hidden","true");}

$("#productGrid").addEventListener("click",e=>{const btn=e.target.closest("[data-add]");if(btn)addToCart(Number(btn.dataset.add));});
$("#cartItems").addEventListener("click",e=>{const plus=e.target.closest("[data-plus]"),minus=e.target.closest("[data-minus]");if(plus)changeQty(Number(plus.dataset.plus),1);if(minus)changeQty(Number(minus.dataset.minus),-1);});
$("#categories").addEventListener("click",e=>{const btn=e.target.closest("[data-category]");if(!btn)return;state.category=btn.dataset.category;document.querySelectorAll(".category").forEach(b=>b.classList.toggle("active",b===btn));renderProducts();});
$("#searchInput").addEventListener("input",renderProducts);
$("#openCart").addEventListener("click",openCart);$("#closeCart").addEventListener("click",closeCart);
$("#cartOverlay").addEventListener("click",e=>{if(e.target===$("#cartOverlay"))closeCart();});
$("#checkoutButton").addEventListener("click",()=>{if(!state.cart.length)return;closeCart();$("#pixModal").classList.add("open");$("#pixModal").setAttribute("aria-hidden","false");});
function closePix(){$("#pixModal").classList.remove("open");$("#pixModal").setAttribute("aria-hidden","true");}
$("#closePix").addEventListener("click",closePix);
$("#copyPix").addEventListener("click",async()=>{const key=$("#pixKey").textContent;try{await navigator.clipboard.writeText(key);showToast("Chave PIX copiada!");}catch{showToast("Não foi possível copiar automaticamente.");}});
$("#finishOrder").addEventListener("click",()=>{closePix();showToast("Pedido demonstrativo concluído. Combine a confirmação com o bar.");state.cart=[];renderCart();});
$("#showDebtInfo").addEventListener("click",()=>showToast("O saldo é apenas demonstrativo. Consulte o Vaquinha para confirmar sua conta."));
$("#deliveryDate").min=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().split("T")[0];
$("#deliveryForm").addEventListener("submit",e=>{
  e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget).entries());
  const message=`Olá! Gostaria de solicitar uma entrega no Bar do Vaquinha.%0A Nome: ${encodeURIComponent(data.customer)}%0A Telefone: ${encodeURIComponent(data.phone)}%0A Endereço: ${encodeURIComponent(data.address)}%0A Data: ${encodeURIComponent(data.date)}%0A Período: ${encodeURIComponent(data.period)}%0A Observações: ${encodeURIComponent(data.notes||"Nenhuma")}`;
  // Troque o número abaixo pelo WhatsApp oficial do estabelecimento (somente DDI + DDD + número).
  const whatsappNumber="5511999999999";
  window.open(`https://wa.me/${whatsappNumber}?text=${message}`,"_blank");
  showToast("Solicitação preparada no WhatsApp. Confirme o envio por lá.");
});
$("#year").textContent=new Date().getFullYear();
renderProducts();renderCart();
