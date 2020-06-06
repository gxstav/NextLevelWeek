import React, { useEffect , useState , ChangeEvent, FormEvent } from 'react'
import api from '../../services/api'
import axios from 'axios'
import './style.css'
import logo from '../../assets/logo.svg'
import { Link , useHistory } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { Map , TileLayer , Marker } from 'react-leaflet'
import { LeafletMouseEvent } from 'leaflet'

interface Item {
  id: number,
  title: string,
  image_url: string
}

interface IBGEresponseUF {
  sigla: string
}

interface IBGEresponseCity {
  nome: string
}

const CreatePoint = () => {
  const [initialPosition, setInitialPosition] = useState<[number, number]>([0,0])

  const [selectedUF, setSelectedUF] = useState('0')
  const [selectedCity, setSelectedCity] = useState('0')
  const [selectedMarker, setSelectedMarker] = useState<[number, number]>([0,0])
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  
  const [items, setItems] = useState<Item[]>([])
  const [ufs, setUfs] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])

  const [formData, setFormData] = useState({
    name:'',
    email:'',
    phone:''
  })

  const history = useHistory()

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude , longitude } = position.coords
      setInitialPosition([latitude, longitude])
    })
  },[])

  useEffect(() => {
    api.get('items').then(response => {
      setItems(response.data)
    })
  },[])

  useEffect(() => {
    axios.get<IBGEresponseUF[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
      const ufInitials = response.data.map(uf => uf.sigla);
      setUfs(ufInitials)
    })
  },[])

  useEffect(() => {
    if (selectedUF === '0') return
    axios.get<IBGEresponseCity[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`)
    .then(response => {
      const cities = response.data.map(city => city.nome)
      setCities(cities)
    })
  },[selectedUF])

  function selectUF(event: ChangeEvent<HTMLSelectElement>){
    const uf = event.target.value
    setSelectedUF(uf)
  }

  function selectCity(event: ChangeEvent<HTMLSelectElement>){
    const city = event.target.value
    setSelectedCity(city)
  }

  function mapMarker(event: LeafletMouseEvent){
    setSelectedMarker([
      event.latlng.lat,
      event.latlng.lng
    ]) 
  }

  function inputChange(event: ChangeEvent<HTMLInputElement>){
    const { name , value } = event.target
    setFormData({...formData, [name]:value })
  }

  function selectedItem(itemId: number){
    const hasBeenSelected = selectedItems.findIndex(id => id === itemId)
    if (hasBeenSelected >= 0) {
      const filteredItems = selectedItems.filter(id => id !== itemId)
      setSelectedItems(filteredItems)
    } else {
      setSelectedItems([...selectedItems, itemId])
    }
  }

  async function submitForm(event: FormEvent){
    event.preventDefault()

    const { name , email , phone } = formData
    const city = selectedCity
    const uf = selectedUF
    const [ latitude , longitude ] = selectedMarker
    const items = selectedItems

    const data = { name, email, phone, uf, city, latitude, longitude, items }

    await api.post('waypoints', data)
    alert('Ponto de coleta criado!')
    history.push('/')
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta"/>
        <Link to="/">
          <FiArrowLeft/>
          Voltar para home
        </Link>
      </header>

      <form onSubmit={submitForm}>
        <h1>Cadastro do <br/> ponto de coleta</h1>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input type="text" name="name" id="name" onChange={inputChange}/>
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input type="text" name="email" id="email" onChange={inputChange}/>
            </div>
            <div className="field">
              <label htmlFor="phone">Whatsapp</label>
              <input type="text" name="phone" id="phone" onChange={inputChange}/>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>        
            <span>Selecione o endereço no mapa</span>
          </legend>
          {/* [ -27.5933 , -48.5276] */}
          <Map center={initialPosition} zoom={12} onClick={mapMarker}>
            <TileLayer attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
            <Marker position={selectedMarker}/>
          </Map>

          

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select name="uf" id="uf" value={selectedUF} onChange={selectUF}>
                <option value="0">Selecione o estado</option>
                {ufs.map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select name="city" id="city" value={selectedCity} onChange={selectCity}>
                <option value="0">Selecione a cidade</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
              </select>
            </div>
    
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Itens de coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>
          </legend>

          <ul className="items-grid">
            {items.map(item => (
              <li key={item.id} 
                  onClick={() => selectedItem(item.id)}
                  className={selectedItems.includes(item.id) ? 'selected' : ''}
              >
                <img src={item.image_url} alt={item.title}/>
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </fieldset>

        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  )
}

export default CreatePoint;