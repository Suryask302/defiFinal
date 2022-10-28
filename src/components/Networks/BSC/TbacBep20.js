
import React, { useState } from 'react'
import '../../../assets/Stylesheets/Trpage.css'
import axios from 'axios'
import { bep20Abi, bep20Address } from '../../../contracts/BEP20'
import { utils } from 'ethers'
import { Spinner } from 'reactstrap'
import { Loader, Placeholder } from 'rsuite';
import Swal from 'sweetalert2'

import moment from 'moment'
let now = moment()


const TbacBep20 = (props) => {

    let [tbacC, setTbac] = useState({ oneTbac: 0, allTbac: 0 })
    let [loading, setLoading] = useState(false)
    let [tbacDisabled, settbacDisabled] = useState(false)
    let [err, setErr] = useState(null)

    let [transData, setTransData] = useState({
        status: '', trHash: '', apires: '', dateTime: ''
    })


    let {


        or_orderid,
        or_custid,
        or_curr_amt,
        re_orderID,

    } = props.data

    let w3 = props.we
    setTbac({ oneTbac: 16.00, allTbac: (or_curr_amt) / 16 })


    async function TbacTransaction() {

        try {

            setLoading(true)
            settbacDisabled(true)

            let tbac = or_curr_amt / 16
            tbac = tbac * 10000000000000000
            tbac = tbac / 10000000000000000
            tbac = tbac.toFixed(5)
            let amt = utils.parseUnits(tbac.toString(), 8)
            console.log(amt)

            if (tbac) {

                let bep20 = new w3.eth.Contract(bep20Abi, bep20Address)

                let balance = await bep20.methods.balanceOf(props['props']).call()
                balance = balance / 100000000

                if (tbac >= balance) {
                    return setErr('insufficient TBAC Balance')
                }

                await bep20.methods.transfer('0xFAe130F5E0dB53fCB3C0fd19bc9F20Cb7625a8E5', amt._hex).send({
                    from: props['props'],
                    gas: 150000,
                    gasPrice: w3.utils.toWei('54.05', 'gwei')

                }).then(reciept => {
                    console.log(reciept)

                    async function coin2resp() {

                        try {

                            let c2resp = await axios({

                                method: 'Post',
                                url: `https://fifityfifty.herokuapp.com/sqlFinalTr`,
                                data: {

                                    order_id: re_orderID,
                                    payment_status: 'confirmed',
                                    pay_currency: 'TBAC(Bsc)',
                                    pay_amount: or_curr_amt,
                                    actually_paid: Number(tbacC.allTbac),
                                    address: reciept.transactionHash,
                                    updated_at: now.format('lll'),
                                    Coin_Rate: tbacC.oneTbac

                                }

                            })


                            if (c2resp) {
                                setLoading(false)
                                setTransData({ trHash: reciept.transactionHash, apires: c2resp.data.data['Coin2_APres'], dateTime: now.format('lll'), status: (reciept.status === true) ? true : false })
                                Swal.fire({

                                    icon: 'success',
                                    title: 'Transaction Done',
                                    showConfirmButton: false,
                                    timer: 2000

                                })
                            }

                        } catch (error) {

                        }
                    }

                    coin2resp()

                }).catch(e => setErr(e.message))

            }

        } catch (error) {

        }

    }


    return (
        err ? Swal.fire({

            icon: 'error',
            title: 'Oops...',
            text: `${err}`,

        }).then(_ => window.location.replace(`https://user.defiai.io/buy100dapp.aspx?Status=0&Message=${err}&orderid=${or_orderid}`)) :

            loading ?
                <div className='row'>
                    <div className='col-3'></div>
                    <div className='col-6' style={{ textAlign: 'center' }}>
                        <Placeholder.Paragraph rows={12} />
                        <Loader center size="lg" vertical content="Processing Transaction Please wait..." />
                    </div>
                    <div className='col-3'></div>

                </div>
                :

                <>
                    <form id="form1">
                        <div className="container">
                            <div className="row m-0">
                                <div className="col-lg-3 p-0 ps-lg-5"> </div>
                                <div className="col-lg-6 p-0">
                                    <div className="row m-0 newStyle">
                                        <div className="col-4 px-4">
                                            <div className="d-flex mb-2">
                                                <p className="textmuted">custid :&nbsp;&nbsp;</p>
                                                <p className="fs-14 fw-bold"> {or_custid}</p>
                                            </div>
                                        </div>
                                        <div className="col-4 px-4">
                                            <div className="d-flex mb-2">
                                                <p className="textmuted">Total Amount:&nbsp;&nbsp;</p>
                                                <p className="fs-14 fw-bold"> {or_curr_amt}</p>
                                            </div>
                                        </div> <div className="col-4 px-4">
                                            <div className="d-flex mb-2">
                                                <p className="textmuted">Order ID :&nbsp;&nbsp;</p>
                                                <p className="fs-14 fw-bold"> {or_orderid}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-3 p-0 ps-lg-5"> </div>
                            </div>
                            <div className="col-lg-6 p-0 ps-lg-5">




                                <div className="row m-0">
                                    <div className="col-12 px-4">
                                        <div className="d-flex align-items-end mt-4 mb-2">
                                            <div className="col-lg-10 p-0 ps-lg-5">
                                                <p className="h4 m-0">
                                                    <span className="pe-1"> "TBAC BEP20 </span>
                                                </p>
                                                <p className="ps-3 textmuted"> BSC </p></div>
                                            {/* <div className="col-lg-2 p-0 ps-lg-5"><img src="" className="rotate" alt='TBAC' /></div> */}
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <p className="textmuted">Amount</p>
                                            <p className="fs-14 fw-bold">{or_curr_amt}</p>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <p className="textmuted">rate</p>
                                            <p className="fs-14 fw-bold"> 1 TBAC = <span className="fas fa-dollar-sign pe-1"></span>{Number(tbacC.oneTbac).toFixed(5)}</p>
                                        </div>

                                        <div className="d-flex justify-content-between mb-3">
                                            <p className="textmuted fw-bold">Total TBAC</p>
                                            <div className="d-flex align-text-top ">
                                                <span className="mt-1 pe-1 fs-14 "></span><span className="h4">{Number(tbacC.allTbac).toFixed(5)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12 px-0">
                                        <div className="row bg-light m-0">
                                            <div className="col-12 px-4 my-4">
                                                <p className="fw-bold">Payment Status</p>
                                            </div>
                                            <div className="col-12 px-4">
                                                <div className="d-flex  mb-4">
                                                    <span className="">
                                                        <p className="text-muted">Status</p>
                                                        <input className="form-control" type="text" value={transData.apires ? transData.apires : "pending"}
                                                            placeholder="1234 5678 9012 3456" readOnly />
                                                    </span>
                                                    <div className=" w-100 d-flex flex-column align-items-end">
                                                        <p className="text-muted">Date and Time</p>
                                                        <input className="form-control2" type="text" value={transData.dateTime ? transData.dateTime : "--/----"} placeholder="MM/YYYY" readOnly />
                                                    </div>
                                                </div>
                                                <div className="d-flex mb-5">
                                                    <span className="me-5">
                                                        <p className="text-muted">Transaction Hash</p>
                                                        <input className="form-control" type="text" value={transData.trHash ? transData.trHash : "0x...."}
                                                            placeholder="Name" readOnly />
                                                    </span>
                                                    <div className="w-100 d-flex flex-column align-items-end">
                                                        <p className="text-muted">ApRes</p>
                                                        <input className="form-control3" type="text" value={transData.apires ? transData.apires : "Pending"} placeholder="XXX" readOnly />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row m-0">
                                            <div className="col-12  mb-4 p-0">

                                                {

                                                    transData.apires === 'Success' ?
                                                        <button disabled={true} className="btn btn-primary"> Transaction Completed </button>
                                                        :
                                                        <button disabled={tbacDisabled} className="btn btn-primary" onClick={TbacTransaction}>
                                                            {loading ? <Spinner color='light' /> : transData.apires ? "Transaction Completed" : "Pay Now"}
                                                            {loading ? <span> </span> : <span className="fas fa-arrow-right ps-2"></span>}
                                                        </button>

                                                }

                                            </div>
                                        </div>
                                    </div>
                                </div>





                            </div>
                        </div>
                    </form>
                </>
    )



}

export default TbacBep20